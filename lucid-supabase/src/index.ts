/**
 * @dreamstack/lucid-supabase
 *
 * Supabase connector for Lucid.js
 *
 * @example
 * ```ts
 * import { createSupabaseConnector, SupabaseSyncManager } from '@dreamstack/lucid-supabase';
 * import { createClient } from '@supabase/supabase-js';
 *
 * const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 *
 * // Simple connector (upload only)
 * const connector = createSupabaseConnector({
 *   client: supabase,
 *   schema: lucidSchema,
 *   store: sqliteStore,
 * });
 *
 * // Full sync manager (bidirectional + realtime)
 * const syncManager = new SupabaseSyncManager({
 *   client: supabase,
 *   schema: lucidSchema,
 *   store: sqliteStore,
 *   syncInterval: 30000,
 * });
 *
 * await syncManager.start();
 * ```
 */

export {
  createSupabaseConnector,
  SupabaseSyncManager,
  type SupabaseConnectorOptions,
  type SyncManagerOptions,
} from './connector';
