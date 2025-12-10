/**
 * @dreamstack/lucid-trpc - Type Definitions
 */

import type {
  LucidConnector,
  LucidSchema,
  LucidStore,
  CrudOperation,
} from '@dreamstack-us/lucid-core';

// ============================================================================
// Extended Connector Interface
// ============================================================================

/**
 * Options for fetching data from the server
 */
export interface FetchOptions {
  /** Only fetch records updated after this timestamp */
  since?: number;
  /** Limit number of records */
  limit?: number;
  /** Filter criteria */
  where?: Record<string, unknown>;
}

/**
 * Realtime change event from server
 */
export interface RealtimeChange {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Record<string, unknown>;
  oldRecord?: Record<string, unknown>;
}

/**
 * Extended connector interface for bidirectional sync
 */
export interface LucidBidirectionalConnector extends LucidConnector {
  /** Download data from server for a table */
  fetchData: (table: string, options?: FetchOptions) => Promise<Record<string, unknown>[]>;

  /** Subscribe to realtime changes (optional) */
  subscribe?: (table: string, callback: (change: RealtimeChange) => void) => () => void;
}

// ============================================================================
// Connector Options
// ============================================================================

/**
 * Procedure name mapping for mutations
 */
export interface ProcedureMap {
  /** Procedure name for INSERT operations (default: 'create') */
  insert?: string;
  /** Procedure name for UPDATE operations (default: 'update') */
  update?: string;
  /** Procedure name for DELETE operations (default: 'delete') */
  delete?: string;
}

/**
 * Generic tRPC client type
 * This is a simplified type that matches the basic structure of tRPC clients
 */
export type TrpcClientLike = Record<string, TrpcRouterLike>;

export type TrpcRouterLike = {
  [key: string]: {
    query?: (input?: unknown) => Promise<unknown>;
    mutate?: (input?: unknown) => Promise<unknown>;
  };
};

/**
 * Options for creating a tRPC connector
 */
export interface TrpcConnectorOptions {
  /** tRPC client instance */
  client: TrpcClientLike;

  /** Lucid schema for table metadata */
  schema: LucidSchema;

  /** Lucid store for writing downloaded data */
  store: LucidStore;

  /**
   * Map Lucid table names to tRPC router paths
   * @example { posts: 'posts', tags: 'tags' }
   */
  routerMap: Record<string, string>;

  /**
   * Custom procedure name mapping for mutations
   * Default: { insert: 'create', update: 'update', delete: 'delete' }
   */
  procedureMap?: ProcedureMap;

  /**
   * Custom procedure name for fetching (list query)
   * Default: 'list'
   */
  fetchProcedure?: string;

  /**
   * Transform data before sending to tRPC (upload)
   */
  transformUpload?: (
    table: string,
    operation: CrudOperation,
    data: Record<string, unknown>
  ) => Record<string, unknown>;

  /**
   * Transform data after receiving from tRPC (download)
   */
  transformDownload?: (
    table: string,
    data: Record<string, unknown>
  ) => Record<string, unknown>;

  /**
   * Get auth token for tRPC headers
   */
  getAccessToken?: () => string | null;

  /**
   * Sync interval in ms (default: 30000 = 30s)
   */
  syncInterval?: number;

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

// ============================================================================
// Sync Manager Options
// ============================================================================

export interface TrpcSyncManagerOptions {
  /** The bidirectional connector */
  connector: LucidBidirectionalConnector;

  /** Lucid schema for table metadata */
  schema: LucidSchema;

  /** Lucid store for sync operations */
  store: LucidStore;

  /** Tables to sync (defaults to all synced tables) */
  tables?: string[];

  /** Sync interval in ms (default: 30000) */
  syncInterval?: number;

  /** Enable debug logging */
  debug?: boolean;
}
