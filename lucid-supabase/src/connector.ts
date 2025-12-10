/**
 * @dreamstack/lucid-supabase - Connector
 *
 * Supabase connector for syncing local data with Supabase backend
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  LucidConnector,
  CrudBatch,
  LucidSchema,
  LucidStore,
} from '@dreamstack-us/lucid-core';
import { getSupabaseTableName, shouldSync, getTableCategory } from '@dreamstack-us/lucid-core';

// ============================================================================
// Connector Options
// ============================================================================

export interface SupabaseConnectorOptions {
  /** Supabase client instance */
  client: SupabaseClient;
  /** Lucid schema for table mapping */
  schema: LucidSchema;
  /** Local store for syncing data down */
  store: LucidStore;
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// Connector Factory
// ============================================================================

/**
 * Create a Supabase connector for Lucid.js
 *
 * @example
 * ```ts
 * const connector = createSupabaseConnector({
 *   client: supabase,
 *   schema: lucidSchema,
 *   store: sqliteStore,
 * });
 * ```
 */
export function createSupabaseConnector(
  options: SupabaseConnectorOptions
): LucidConnector {
  const { client, schema, store, debug = false } = options;

  const log = (...args: unknown[]) => {
    if (debug) {
      console.log('[@dreamstack/lucid-supabase]', ...args);
    }
  };

  return {
    /**
     * Upload local changes to Supabase
     */
    async uploadData(batch: CrudBatch): Promise<void> {
      log(`Uploading batch of ${batch.entries.length} entries`);

      for (const entry of batch.entries) {
        const tableSchema = schema[entry.table];
        if (!tableSchema || !shouldSync(tableSchema)) {
          log(`Skipping ${entry.table} - not synced`);
          continue;
        }

        const supabaseTable = getSupabaseTableName(entry.table, tableSchema);
        log(`${entry.operation} on ${supabaseTable}:`, entry.data);

        try {
          switch (entry.operation) {
            case 'INSERT': {
              const { error } = await client
                .from(supabaseTable)
                .insert(entry.data);
              if (error) throw error;
              break;
            }
            case 'UPDATE': {
              const { id, ...data } = entry.data;
              const { error } = await client
                .from(supabaseTable)
                .update(data)
                .eq('id', id);
              if (error) throw error;
              break;
            }
            case 'DELETE': {
              const { error } = await client
                .from(supabaseTable)
                .delete()
                .eq('id', entry.data.id);
              if (error) throw error;
              break;
            }
          }
        } catch (error) {
          console.error(`[@dreamstack/lucid-supabase] Failed to ${entry.operation} on ${supabaseTable}:`, error);
          throw error;
        }
      }

      log('Batch upload complete');
    },

    /**
     * Fetch credentials from Supabase auth
     */
    async fetchCredentials() {
      const { data: { session } } = await client.auth.getSession();

      if (!session) {
        throw new Error('No Supabase session');
      }

      return {
        accessToken: session.access_token,
        expiresAt: session.expires_at,
      };
    },
  };
}

// ============================================================================
// Sync Manager
// ============================================================================

export interface SyncManagerOptions extends SupabaseConnectorOptions {
  /** Tables to sync (defaults to all synced tables in schema) */
  tables?: string[];
  /** Sync interval in ms (default: 30000) */
  syncInterval?: number;
}

/**
 * Manages bidirectional sync between local store and Supabase
 */
export class SupabaseSyncManager {
  private client: SupabaseClient;
  private schema: LucidSchema;
  private store: LucidStore;
  private tables: string[];
  private syncInterval: number;
  private debug: boolean;
  private intervalId: NodeJS.Timeout | null = null;
  private realtimeChannels: Map<string, ReturnType<SupabaseClient['channel']>> = new Map();

  constructor(options: SyncManagerOptions) {
    this.client = options.client;
    this.schema = options.schema;
    this.store = options.store;
    this.debug = options.debug ?? false;
    this.syncInterval = options.syncInterval ?? 30000;

    // Get tables to sync
    this.tables = options.tables ?? Object.keys(options.schema).filter((t) => {
      const tableSchema = options.schema[t];
      return shouldSync(tableSchema);
    });
  }

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log('[@dreamstack/lucid-supabase]', ...args);
    }
  }

  /**
   * Start syncing
   */
  async start(): Promise<void> {
    this.log('Starting sync manager');

    // Initial sync
    await this.syncAll();

    // Set up periodic sync
    this.intervalId = setInterval(() => {
      this.syncAll().catch((err) => {
        console.error('[@dreamstack/lucid-supabase] Periodic sync failed:', err);
      });
    }, this.syncInterval);

    // Set up realtime subscriptions for REALTIME tables
    for (const tableName of this.tables) {
      const tableSchema = this.schema[tableName];
      const category = getTableCategory(tableSchema);

      if (category === 'realtime') {
        await this.subscribeToRealtime(tableName);
      }
    }
  }

  /**
   * Stop syncing
   */
  stop(): void {
    this.log('Stopping sync manager');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Unsubscribe from realtime
    for (const [, channel] of this.realtimeChannels) {
      channel.unsubscribe();
    }
    this.realtimeChannels.clear();
  }

  /**
   * Sync all tables
   */
  async syncAll(): Promise<void> {
    this.log('Syncing all tables');

    for (const tableName of this.tables) {
      try {
        await this.syncTable(tableName);
      } catch (error) {
        console.error(`[@dreamstack/lucid-supabase] Failed to sync ${tableName}:`, error);
      }
    }
  }

  /**
   * Sync a single table
   */
  async syncTable(tableName: string): Promise<void> {
    const tableSchema = this.schema[tableName];
    if (!tableSchema) return;

    const supabaseTable = getSupabaseTableName(tableName, tableSchema);
    const lastSyncedAt = await this.store.getLastSyncedAt(tableName);

    this.log(`Syncing ${tableName} (last: ${lastSyncedAt ? new Date(lastSyncedAt).toISOString() : 'never'})`);

    // Fetch data from Supabase
    let query = this.client.from(supabaseTable).select('*');

    // Only fetch newer data if we have synced before
    if (lastSyncedAt) {
      query = query.gt('updated_at', new Date(lastSyncedAt).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      this.log(`Received ${data.length} rows for ${tableName}`);
      await this.store.upsertBatch(tableName, data);
    }

    // Update last synced timestamp
    await this.store.setLastSyncedAt(tableName, Date.now());
  }

  /**
   * Subscribe to realtime changes for a table
   */
  private async subscribeToRealtime(tableName: string): Promise<void> {
    const tableSchema = this.schema[tableName];
    const supabaseTable = getSupabaseTableName(tableName, tableSchema);

    this.log(`Subscribing to realtime: ${supabaseTable}`);

    const channel = this.client
      .channel(`lucid:${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: supabaseTable,
        },
        async (payload) => {
          this.log(`Realtime event on ${tableName}:`, payload.eventType);

          switch (payload.eventType) {
            case 'INSERT':
            case 'UPDATE':
              await this.store.upsertBatch(tableName, [payload.new as Record<string, unknown>]);
              break;
            case 'DELETE':
              if (payload.old && (payload.old as any).id) {
                await this.store.delete(tableName, (payload.old as any).id);
              }
              break;
          }
        }
      )
      .subscribe();

    this.realtimeChannels.set(tableName, channel);
  }
}
