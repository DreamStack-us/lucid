/**
 * @dreamstack/lucid-core
 *
 * Core engine for Lucid.js - the offline-first data layer
 * Built on Supabase for rapid go-to-market
 *
 * @example
 * ```ts
 * import { schema, table, column, categories } from '@dreamstack/lucid-core';
 *
 * export const lucidSchema = schema({
 *   products: table({
 *     name: column.text,
 *     price: column.real,
 *   }).reference('24h'),
 *
 *   orders: table({
 *     product_id: column.text,
 *     quantity: column.integer,
 *   }).userOwned({ syncOnFocus: true }),
 * });
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────
export {
  schema,
  table,
  column,
  categories,
  TableBuilder,
  parseStaleTime,
  isStale,
  getTableCategory,
  shouldSync,
  getSupabaseTableName,
} from './schema';

// ─────────────────────────────────────────────────────────────────────────────
// Queue
// ─────────────────────────────────────────────────────────────────────────────
export {
  UploadQueue,
  QueueProcessor,
  type QueueProcessorOptions,
} from './queue';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type {
  // Columns
  ColumnType,
  ColumnDefinition,
  // Categories
  DataCategory,
  StaleTime,
  CategoryOptions,
  StaticCategoryOptions,
  ReferenceCategoryOptions,
  UserOwnedCategoryOptions,
  RealtimeCategoryOptions,
  // Schema
  TableDefinition,
  LucidSchema,
  InferTable,
  // CRUD
  CrudOperation,
  CrudEntry,
  CrudBatch,
  // Sync
  SyncStatus,
  LucidConnector,
  // Interfaces
  LucidDatabase,
  LucidStore,
} from './types';
