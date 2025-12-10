/**
 * @dreamstack/lucid-trpc - Sync Manager
 *
 * Manages bidirectional sync between local store and tRPC backend
 */

import { shouldSync, getTableCategory } from '@dreamstack-us/lucid-core';
import type { LucidSchema, LucidStore } from '@dreamstack-us/lucid-core';
import type { LucidBidirectionalConnector, TrpcSyncManagerOptions } from './types';

// ============================================================================
// Sync Manager
// ============================================================================

/**
 * Manages bidirectional sync between local store and tRPC backend
 *
 * @example
 * ```ts
 * const syncManager = new TrpcSyncManager({
 *   connector,
 *   schema: lucidSchema,
 *   store,
 *   syncInterval: 30000,
 * });
 *
 * // Start syncing
 * await syncManager.start();
 *
 * // Stop when done
 * syncManager.stop();
 * ```
 */
export class TrpcSyncManager {
  private connector: LucidBidirectionalConnector;
  private schema: LucidSchema;
  private store: LucidStore;
  private tables: string[];
  private syncInterval: number;
  private debug: boolean;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isSyncing: boolean = false;
  private subscriptions: Map<string, () => void> = new Map();

  constructor(options: TrpcSyncManagerOptions) {
    this.connector = options.connector;
    this.schema = options.schema;
    this.store = options.store;
    this.debug = options.debug ?? false;
    this.syncInterval = options.syncInterval ?? 30000;

    // Get tables to sync (either specified or all synced tables from schema)
    this.tables =
      options.tables ??
      Object.keys(options.schema).filter((t) => {
        const tableSchema = options.schema[t];
        return shouldSync(tableSchema);
      });
  }

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log('[@dreamstack/lucid-trpc:SyncManager]', ...args);
    }
  }

  /**
   * Start the sync manager
   * Performs initial sync and sets up periodic sync
   */
  async start(): Promise<void> {
    this.log('Starting sync manager');
    this.log('Tables to sync:', this.tables);

    // Initial sync
    await this.syncAll();

    // Set up periodic sync
    this.intervalId = setInterval(() => {
      this.syncAll().catch((err) => {
        console.error('[@dreamstack/lucid-trpc:SyncManager] Periodic sync failed:', err);
      });
    }, this.syncInterval);

    // Set up realtime subscriptions for REALTIME category tables
    for (const tableName of this.tables) {
      const tableSchema = this.schema[tableName];
      const category = getTableCategory(tableSchema);

      if (category === 'realtime' && this.connector.subscribe) {
        this.subscribeToRealtime(tableName);
      }
    }

    this.log('Sync manager started');
  }

  /**
   * Stop the sync manager
   */
  stop(): void {
    this.log('Stopping sync manager');

    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Unsubscribe from realtime
    for (const [tableName, unsubscribe] of this.subscriptions) {
      this.log(`Unsubscribing from realtime: ${tableName}`);
      unsubscribe();
    }
    this.subscriptions.clear();

    this.log('Sync manager stopped');
  }

  /**
   * Check if the sync manager is running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Check if currently syncing
   */
  isBusy(): boolean {
    return this.isSyncing;
  }

  /**
   * Sync all tables
   */
  async syncAll(): Promise<void> {
    if (this.isSyncing) {
      this.log('Sync already in progress, skipping');
      return;
    }

    this.isSyncing = true;
    this.log('Syncing all tables');

    try {
      for (const tableName of this.tables) {
        try {
          await this.syncTable(tableName);
        } catch (error) {
          console.error(
            `[@dreamstack/lucid-trpc:SyncManager] Failed to sync ${tableName}:`,
            error
          );
          // Continue with other tables even if one fails
        }
      }
    } finally {
      this.isSyncing = false;
    }

    this.log('Sync all complete');
  }

  /**
   * Sync a single table
   */
  async syncTable(tableName: string): Promise<void> {
    const tableSchema = this.schema[tableName];
    if (!tableSchema) {
      this.log(`Table not found in schema: ${tableName}`);
      return;
    }

    if (!shouldSync(tableSchema)) {
      this.log(`Table not synced: ${tableName}`);
      return;
    }

    const lastSyncedAt = await this.store.getLastSyncedAt(tableName);

    this.log(
      `Syncing ${tableName} (last: ${
        lastSyncedAt ? new Date(lastSyncedAt).toISOString() : 'never'
      })`
    );

    // Fetch data from server
    await this.connector.fetchData(tableName, {
      since: lastSyncedAt ?? undefined,
    });
  }

  /**
   * Force sync a specific table (ignore sync interval)
   */
  async forceSync(tableName: string): Promise<void> {
    this.log(`Force syncing ${tableName}`);
    await this.syncTable(tableName);
  }

  /**
   * Force sync all tables (ignore sync interval)
   */
  async forceSyncAll(): Promise<void> {
    this.log('Force syncing all tables');
    await this.syncAll();
  }

  /**
   * Subscribe to realtime changes for a table
   */
  private subscribeToRealtime(tableName: string): void {
    if (!this.connector.subscribe) {
      this.log(`Realtime not supported, skipping ${tableName}`);
      return;
    }

    this.log(`Subscribing to realtime: ${tableName}`);

    const unsubscribe = this.connector.subscribe(tableName, async (change) => {
      this.log(`Realtime change on ${tableName}:`, change.type);

      try {
        switch (change.type) {
          case 'INSERT':
          case 'UPDATE':
            await this.store.upsertBatch(tableName, [change.record]);
            break;
          case 'DELETE':
            if (change.record.id) {
              await this.store.delete(tableName, change.record.id as string);
            }
            break;
        }
      } catch (error) {
        console.error(
          `[@dreamstack/lucid-trpc:SyncManager] Failed to handle realtime change:`,
          error
        );
      }
    });

    this.subscriptions.set(tableName, unsubscribe);
  }

  /**
   * Get sync status for a table
   */
  async getTableSyncStatus(tableName: string): Promise<{
    lastSyncedAt: number | null;
    isSynced: boolean;
  }> {
    const lastSyncedAt = await this.store.getLastSyncedAt(tableName);
    return {
      lastSyncedAt,
      isSynced: lastSyncedAt !== null,
    };
  }

  /**
   * Get sync status for all tables
   */
  async getSyncStatus(): Promise<
    Record<
      string,
      {
        lastSyncedAt: number | null;
        isSynced: boolean;
      }
    >
  > {
    const status: Record<string, { lastSyncedAt: number | null; isSynced: boolean }> = {};

    for (const tableName of this.tables) {
      status[tableName] = await this.getTableSyncStatus(tableName);
    }

    return status;
  }
}
