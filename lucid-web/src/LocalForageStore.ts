/**
 * @dreamstack/lucid-web - LocalForage Store
 *
 * Browser-based implementation of LucidStore using localForage (IndexedDB)
 */

import localforage from 'localforage';
import type { LucidStore, LucidSchema, CrudEntry } from '@dreamstack-us/lucid-core';

// Internal store names
const STORES = {
  CRUD_QUEUE: 'lucid_crud_queue',
  SYNC_META: 'lucid_sync_meta',
} as const;

// ============================================================================
// Types
// ============================================================================

export interface LocalForageStoreOptions {
  /** Database name (default: 'lucid') */
  name?: string;
  /** Store name prefix for tables (default: 'lucid_') */
  storePrefix?: string;
  /** Driver preference order */
  driver?: string[];
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// LocalForageStore Implementation
// ============================================================================

export class LocalForageStore implements LucidStore {
  private dbName: string;
  private storePrefix: string;
  private debug: boolean;
  private driver: string[] | undefined;
  private stores: Map<string, LocalForage> = new Map();
  private queueStore: LocalForage | null = null;
  private metaStore: LocalForage | null = null;
  private schema: LucidSchema | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(options: LocalForageStoreOptions = {}) {
    this.dbName = options.name ?? 'lucid';
    this.storePrefix = options.storePrefix ?? 'lucid_';
    this.debug = options.debug ?? false;
    this.driver = options.driver;
  }

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log('[@dreamstack/lucid-web]', ...args);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialize the store with a schema
   */
  async initialize(schema: LucidSchema): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize(schema);
    return this.initPromise;
  }

  private async _initialize(schema: LucidSchema): Promise<void> {
    this.schema = schema;
    this.log('Initializing store with schema:', Object.keys(schema));

    // Configure localforage defaults
    const config: LocalForageOptions = {
      name: this.dbName,
    };

    if (this.driver) {
      config.driver = this.driver;
    }

    // Create queue store
    this.queueStore = localforage.createInstance({
      ...config,
      storeName: STORES.CRUD_QUEUE,
    });

    // Create meta store
    this.metaStore = localforage.createInstance({
      ...config,
      storeName: STORES.SYNC_META,
    });

    // Create a store for each table in the schema
    for (const tableName of Object.keys(schema)) {
      const store = localforage.createInstance({
        ...config,
        storeName: `${this.storePrefix}${tableName}`,
      });
      this.stores.set(tableName, store);
      this.log(`Created store for table: ${tableName}`);
    }
  }

  private getStore(table: string): LocalForage {
    const store = this.stores.get(table);
    if (!store) {
      throw new Error(`Store not found for table: ${table}. Did you forget to add it to the schema?`);
    }
    return store;
  }

  private getQueueStore(): LocalForage {
    if (!this.queueStore) {
      throw new Error('LocalForageStore not initialized. Call initialize() first.');
    }
    return this.queueStore;
  }

  private getMetaStore(): LocalForage {
    if (!this.metaStore) {
      throw new Error('LocalForageStore not initialized. Call initialize() first.');
    }
    return this.metaStore;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD Operations
  // ─────────────────────────────────────────────────────────────────────────

  async get<T>(table: string, id: string): Promise<T | null> {
    const store = this.getStore(table);
    const item = await store.getItem<T>(id);
    this.log(`get ${table}/${id}:`, item ? 'found' : 'not found');
    return item;
  }

  async getAll<T>(table: string): Promise<T[]> {
    const store = this.getStore(table);
    const items: T[] = [];

    await store.iterate<T, void>((value) => {
      items.push(value);
    });

    this.log(`getAll ${table}: ${items.length} items`);
    return items;
  }

  async query<T>(table: string, where: Record<string, unknown>): Promise<T[]> {
    const all = await this.getAll<T>(table);

    const results = all.filter((item) => {
      const record = item as Record<string, unknown>;
      return Object.entries(where).every(([key, value]) => record[key] === value);
    });

    this.log(`query ${table}:`, where, `-> ${results.length} results`);
    return results;
  }

  async insert<T extends Record<string, unknown>>(table: string, data: T): Promise<void> {
    const store = this.getStore(table);
    const id = data.id as string;

    if (!id) {
      throw new Error('Insert data must include an id field');
    }

    const withMeta = {
      ...data,
      _updatedAt: Date.now(),
      _synced: false,
    };

    await store.setItem(id, withMeta);
    this.log(`insert ${table}/${id}`);
  }

  async update(table: string, id: string, data: Record<string, unknown>): Promise<void> {
    const store = this.getStore(table);
    const existing = await store.getItem<Record<string, unknown>>(id);

    if (!existing) {
      throw new Error(`Record not found: ${table}/${id}`);
    }

    const updated = {
      ...existing,
      ...data,
      _updatedAt: Date.now(),
      _synced: false,
    };

    await store.setItem(id, updated);
    this.log(`update ${table}/${id}`);
  }

  async delete(table: string, id: string): Promise<void> {
    const store = this.getStore(table);
    await store.removeItem(id);
    this.log(`delete ${table}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Bulk Operations (for sync)
  // ─────────────────────────────────────────────────────────────────────────

  async upsertBatch(table: string, rows: Record<string, unknown>[]): Promise<void> {
    if (rows.length === 0) return;

    const store = this.getStore(table);
    const now = Date.now();

    for (const row of rows) {
      const id = row.id as string;
      if (!id) {
        this.log(`Skipping row without id in ${table}`);
        continue;
      }

      await store.setItem(id, {
        ...row,
        _updatedAt: now,
        _synced: true,
      });
    }

    this.log(`upsertBatch ${table}: ${rows.length} rows`);
  }

  async deleteBatch(table: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const store = this.getStore(table);

    for (const id of ids) {
      await store.removeItem(id);
    }

    this.log(`deleteBatch ${table}: ${ids.length} rows`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Queue Operations
  // ─────────────────────────────────────────────────────────────────────────

  async queueCrud(entry: CrudEntry): Promise<void> {
    const store = this.getQueueStore();
    await store.setItem(entry.id, entry);
    this.log(`queueCrud: ${entry.operation} on ${entry.table}/${entry.data.id}`);
  }

  async getQueuedCrud(limit = 100): Promise<CrudEntry[]> {
    const store = this.getQueueStore();
    const entries: CrudEntry[] = [];

    await store.iterate<CrudEntry, void>((value) => {
      entries.push(value);
    });

    // Sort by timestamp (FIFO)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    const result = entries.slice(0, limit);
    this.log(`getQueuedCrud: ${result.length} entries`);
    return result;
  }

  async removeFromQueue(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const store = this.getQueueStore();

    for (const id of ids) {
      await store.removeItem(id);
    }

    this.log(`removeFromQueue: ${ids.length} entries`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Metadata
  // ─────────────────────────────────────────────────────────────────────────

  async getLastSyncedAt(table: string): Promise<number | null> {
    const store = this.getMetaStore();
    const timestamp = await store.getItem<number>(`sync_${table}`);
    return timestamp;
  }

  async setLastSyncedAt(table: string, timestamp: number): Promise<void> {
    const store = this.getMetaStore();
    await store.setItem(`sync_${table}`, timestamp);
    this.log(`setLastSyncedAt ${table}: ${new Date(timestamp).toISOString()}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Clear all data for a specific table
   */
  async clearTable(table: string): Promise<void> {
    const store = this.getStore(table);
    await store.clear();
    this.log(`clearTable: ${table}`);
  }

  /**
   * Clear all data including queue and metadata
   */
  async clearAll(): Promise<void> {
    // Clear all table stores
    for (const store of this.stores.values()) {
      await store.clear();
    }

    // Clear queue and meta
    if (this.queueStore) {
      await this.queueStore.clear();
    }
    if (this.metaStore) {
      await this.metaStore.clear();
    }

    this.log('clearAll: all data cleared');
  }

  /**
   * Get the number of pending CRUD operations
   */
  async getPendingCount(): Promise<number> {
    const entries = await this.getQueuedCrud();
    return entries.length;
  }

  /**
   * Check if there are pending changes
   */
  async hasPendingChanges(): Promise<boolean> {
    const count = await this.getPendingCount();
    return count > 0;
  }
}
