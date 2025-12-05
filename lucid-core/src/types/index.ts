/**
 * @dreamstack/lucid-core - Type Definitions
 *
 * Core types for the Lucid.js offline-first framework
 */

// ============================================================================
// Column Types (PowerSync-inspired)
// ============================================================================

export type ColumnType = 'text' | 'integer' | 'real' | 'blob';

export interface ColumnDefinition {
  type: ColumnType;
  nullable?: boolean;
  defaultValue?: unknown;
}

export const column = {
  text: { type: 'text' } as ColumnDefinition,
  integer: { type: 'integer' } as ColumnDefinition,
  real: { type: 'real' } as ColumnDefinition,
  blob: { type: 'blob' } as ColumnDefinition,
  // Nullable variants
  textNullable: { type: 'text', nullable: true } as ColumnDefinition,
  integerNullable: { type: 'integer', nullable: true } as ColumnDefinition,
  realNullable: { type: 'real', nullable: true } as ColumnDefinition,
} as const;

// ============================================================================
// Data Categories
// ============================================================================

/**
 * Data categories control caching and sync behavior:
 *
 * STATIC: Version-based. Fetch once per app version.
 *         Use for: config, feature flags, i18n
 *
 * REFERENCE: Time-based. Stale-while-revalidate.
 *            Use for: products, categories, pricing
 *
 * USER_OWNED: Always fresh. Show cached, sync in background.
 *             Use for: user data, orders, saved items
 *
 * REALTIME: Always fetch. Cache only for offline fallback.
 *           Use for: chat, notifications, live feeds
 *
 * LOCAL_ONLY: Never synced. Stays on device.
 *             Use for: drafts, UI state, temp data
 */
export type DataCategory =
  | 'static'
  | 'reference'
  | 'user_owned'
  | 'realtime'
  | 'local_only';

export const categories = {
  STATIC: 'static',
  REFERENCE: 'reference',
  USER_OWNED: 'user_owned',
  REALTIME: 'realtime',
  LOCAL_ONLY: 'local_only',
} as const;

// ============================================================================
// Category Options
// ============================================================================

export type StaleTime = `${number}${'s' | 'm' | 'h' | 'd'}` | number;

export interface StaticCategoryOptions {
  /** Version identifier - refetch when this changes */
  version: string | (() => string | Promise<string>);
}

export interface ReferenceCategoryOptions {
  /** Time until data is considered stale */
  staleTime: StaleTime;
  /** Sync in background when stale (default: true) */
  backgroundSync?: boolean;
}

export interface UserOwnedCategoryOptions {
  /** Time until data is considered stale */
  staleTime?: StaleTime;
  /** Sync when app returns to foreground (default: true) */
  syncOnFocus?: boolean;
  /** Sync when network reconnects (default: true) */
  syncOnReconnect?: boolean;
}

export interface RealtimeCategoryOptions {
  /** Use Supabase realtime subscription (default: true) */
  subscribe?: boolean;
  /** Cache for offline fallback (default: true) */
  fallbackToCache?: boolean;
}

export type CategoryOptions =
  | { category: 'static'; options: StaticCategoryOptions }
  | { category: 'reference'; options: ReferenceCategoryOptions }
  | { category: 'user_owned'; options?: UserOwnedCategoryOptions }
  | { category: 'realtime'; options?: RealtimeCategoryOptions }
  | { category: 'local_only'; options?: never };

// ============================================================================
// Table Definition
// ============================================================================

export interface TableDefinition<TColumns extends Record<string, ColumnDefinition> = Record<string, ColumnDefinition>> {
  columns: TColumns;
  category?: CategoryOptions;
  indexes?: Record<string, string[]>;
  /** Supabase table name (defaults to schema key) */
  supabaseTable?: string;
  /** Primary key column (defaults to 'id') */
  primaryKey?: string;
}

// ============================================================================
// Schema Definition
// ============================================================================

export type LucidSchema = Record<string, TableDefinition>;

// ============================================================================
// Type Inference Helpers
// ============================================================================

/** Infer TypeScript type from column definition */
type InferColumnType<T extends ColumnDefinition> =
  T['type'] extends 'text' ? string :
  T['type'] extends 'integer' ? number :
  T['type'] extends 'real' ? number :
  T['type'] extends 'blob' ? Uint8Array :
  never;

/** Infer TypeScript type from table columns */
export type InferTable<T extends TableDefinition> = {
  id: string; // Auto-added
} & {
  [K in keyof T['columns']]: T['columns'][K]['nullable'] extends true
    ? InferColumnType<T['columns'][K]> | null
    : InferColumnType<T['columns'][K]>;
};

// ============================================================================
// Sync & Queue Types
// ============================================================================

export type CrudOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface CrudEntry {
  id: string;
  table: string;
  operation: CrudOperation;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface CrudBatch {
  entries: CrudEntry[];
  complete: () => Promise<void>;
  abort: () => Promise<void>;
}

export interface SyncStatus {
  connected: boolean;
  lastSyncedAt: number | null;
  uploading: boolean;
  downloading: boolean;
  error: Error | null;
}

// ============================================================================
// Connector Interface (Developer implements this)
// ============================================================================

export interface LucidConnector {
  /** Called to upload local changes to backend */
  uploadData: (batch: CrudBatch) => Promise<void>;

  /** Called to fetch credentials for Supabase */
  fetchCredentials?: () => Promise<{ accessToken: string; expiresAt?: number }>;
}

// ============================================================================
// Database Interface
// ============================================================================

export interface LucidDatabase {
  // Query operations
  get<T>(table: string, id: string): Promise<T | null>;
  getAll<T>(table: string): Promise<T[]>;
  query<T>(table: string, filter: Record<string, unknown>): Promise<T[]>;

  // Mutation operations (auto-queued when offline)
  insert<T>(table: string, data: Omit<T, 'id'>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;

  // Watch for changes (reactive)
  watch<T>(
    table: string,
    callback: (data: T[]) => void,
    filter?: Record<string, unknown>
  ): () => void;

  // Sync control
  connect(connector: LucidConnector): Promise<void>;
  disconnect(): Promise<void>;
  getSyncStatus(): SyncStatus;

  // Queue operations
  getCrudBatch(limit?: number): Promise<CrudBatch | null>;
  hasPendingChanges(): Promise<boolean>;
}

// ============================================================================
// Store Interface (Platform-specific implementations)
// ============================================================================

export interface LucidStore {
  // Initialize with schema
  initialize(schema: LucidSchema): Promise<void>;

  // CRUD
  get<T>(table: string, id: string): Promise<T | null>;
  getAll<T>(table: string): Promise<T[]>;
  query<T>(table: string, where: Record<string, unknown>): Promise<T[]>;
  insert<T>(table: string, data: T): Promise<void>;
  update(table: string, id: string, data: Record<string, unknown>): Promise<void>;
  delete(table: string, id: string): Promise<void>;

  // Bulk operations (for sync)
  upsertBatch(table: string, rows: Record<string, unknown>[]): Promise<void>;
  deleteBatch(table: string, ids: string[]): Promise<void>;

  // Queue
  queueCrud(entry: CrudEntry): Promise<void>;
  getQueuedCrud(limit?: number): Promise<CrudEntry[]>;
  removeFromQueue(ids: string[]): Promise<void>;

  // Metadata
  getLastSyncedAt(table: string): Promise<number | null>;
  setLastSyncedAt(table: string, timestamp: number): Promise<void>;
}
