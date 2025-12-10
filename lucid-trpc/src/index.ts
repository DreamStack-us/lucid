/**
 * @dreamstack/lucid-trpc
 *
 * tRPC connector for Lucid.js - bidirectional sync with tRPC backends
 *
 * @example
 * ```ts
 * import { createTrpcConnector, TrpcSyncManager } from '@dreamstack/lucid-trpc';
 * import { LocalForageStore } from '@dreamstack/lucid-web';
 * import { trpcClient } from './trpc';
 * import { lucidSchema } from './schema';
 *
 * const store = new LocalForageStore({ name: 'myapp' });
 *
 * const connector = createTrpcConnector({
 *   client: trpcClient,
 *   schema: lucidSchema,
 *   store,
 *   routerMap: {
 *     posts: 'posts',
 *     tags: 'tags',
 *   },
 *   getAccessToken: () => authStore.getState().token,
 * });
 *
 * const syncManager = new TrpcSyncManager({
 *   connector,
 *   schema: lucidSchema,
 *   store,
 * });
 *
 * await syncManager.start();
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Connector
// ─────────────────────────────────────────────────────────────────────────────
export { createTrpcConnector } from './connector';

// ─────────────────────────────────────────────────────────────────────────────
// Sync Manager
// ─────────────────────────────────────────────────────────────────────────────
export { TrpcSyncManager } from './sync-manager';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type {
  // Connector types
  TrpcConnectorOptions,
  LucidBidirectionalConnector,
  ProcedureMap,
  TrpcClientLike,
  TrpcRouterLike,
  // Sync types
  TrpcSyncManagerOptions,
  FetchOptions,
  RealtimeChange,
} from './types';
