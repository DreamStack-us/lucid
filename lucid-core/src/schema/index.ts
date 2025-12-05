/**
 * @dreamstack/lucid-core - Schema Definition
 *
 * PowerSync-inspired fluent API for defining your local-first schema
 */

import type {
  ColumnDefinition,
  TableDefinition,
  LucidSchema,
  DataCategory,
  CategoryOptions,
  StaticCategoryOptions,
  ReferenceCategoryOptions,
  UserOwnedCategoryOptions,
  RealtimeCategoryOptions,
  StaleTime,
} from '../types';

// Re-export for convenience
export { column, categories } from '../types';

// ============================================================================
// Table Builder (Fluent API)
// ============================================================================

export class TableBuilder<TColumns extends Record<string, ColumnDefinition>> {
  private _columns: TColumns;
  private _category?: CategoryOptions;
  private _indexes?: Record<string, string[]>;
  private _supabaseTable?: string;
  private _primaryKey?: string;

  constructor(columns: TColumns) {
    this._columns = columns;
  }

  /**
   * Mark as STATIC data - version-based caching
   * Fetches only when version changes (e.g., app deploy)
   */
  static(options: StaticCategoryOptions): this {
    this._category = { category: 'static', options };
    return this;
  }

  /**
   * Mark as REFERENCE data - time-based stale-while-revalidate
   * Good for catalogs, categories, pricing
   */
  reference(staleTime: StaleTime, options?: Omit<ReferenceCategoryOptions, 'staleTime'>): this {
    this._category = {
      category: 'reference',
      options: { staleTime, ...options },
    };
    return this;
  }

  /**
   * Mark as USER_OWNED data - always show cached, always revalidate
   * Good for user's data, orders, saved items
   */
  userOwned(options?: UserOwnedCategoryOptions): this {
    this._category = { category: 'user_owned', options };
    return this;
  }

  /**
   * Mark as REALTIME data - subscribe to live updates
   * Good for chat, notifications, live feeds
   */
  realtime(options?: RealtimeCategoryOptions): this {
    this._category = { category: 'realtime', options };
    return this;
  }

  /**
   * Mark as LOCAL_ONLY - never synced to backend
   * Good for drafts, UI state, temp data
   */
  localOnly(): this {
    this._category = { category: 'local_only' };
    return this;
  }

  /**
   * Add indexes for query performance
   */
  index(name: string, columns: string[]): this {
    this._indexes = this._indexes || {};
    this._indexes[name] = columns;
    return this;
  }

  /**
   * Override the Supabase table name (defaults to schema key)
   */
  supabaseTable(name: string): this {
    this._supabaseTable = name;
    return this;
  }

  /**
   * Override the primary key column (defaults to 'id')
   */
  primaryKey(column: string): this {
    this._primaryKey = column;
    return this;
  }

  /**
   * Build the table definition
   */
  build(): TableDefinition<TColumns> {
    return {
      columns: this._columns,
      category: this._category,
      indexes: this._indexes,
      supabaseTable: this._supabaseTable,
      primaryKey: this._primaryKey,
    };
  }
}

// ============================================================================
// Table Factory Function
// ============================================================================

/**
 * Define a table with typed columns
 *
 * @example
 * ```ts
 * const products = table({
 *   name: column.text,
 *   price: column.real,
 *   stock: column.integer,
 * }).reference('24h');
 * ```
 */
export function table<TColumns extends Record<string, ColumnDefinition>>(
  columns: TColumns
): TableBuilder<TColumns> {
  return new TableBuilder(columns);
}

// ============================================================================
// Schema Factory Function
// ============================================================================

type SchemaInput = Record<string, TableBuilder<any> | TableDefinition>;

/**
 * Define your complete Lucid schema
 *
 * @example
 * ```ts
 * export const lucidSchema = schema({
 *   products: table({
 *     name: column.text,
 *     price: column.real,
 *   }).reference('24h'),
 *
 *   orders: table({
 *     product_id: column.text,
 *     quantity: column.integer,
 *   }).userOwned(),
 *
 *   cart: table({
 *     product_id: column.text,
 *     quantity: column.integer,
 *   }).localOnly(),
 * });
 * ```
 */
export function schema<T extends SchemaInput>(tables: T): LucidSchema {
  const result: LucidSchema = {};

  for (const [key, value] of Object.entries(tables)) {
    if (value instanceof TableBuilder) {
      result[key] = value.build();
    } else {
      result[key] = value as TableDefinition;
    }
  }

  return result;
}

// ============================================================================
// Stale Time Utilities
// ============================================================================

/**
 * Parse stale time string to milliseconds
 */
export function parseStaleTime(staleTime: StaleTime): number {
  if (typeof staleTime === 'number') {
    return staleTime;
  }

  const match = staleTime.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid stale time format: ${staleTime}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}

/**
 * Check if data is stale based on cached timestamp
 */
export function isStale(cachedAt: number, staleTime: StaleTime): boolean {
  const staleMs = parseStaleTime(staleTime);
  return Date.now() - cachedAt > staleMs;
}

// ============================================================================
// Schema Utilities
// ============================================================================

/**
 * Get the category of a table
 */
export function getTableCategory(
  tableSchema: TableDefinition
): DataCategory | undefined {
  return tableSchema.category?.category;
}

/**
 * Check if a table should sync to Supabase
 */
export function shouldSync(tableSchema: TableDefinition): boolean {
  const category = getTableCategory(tableSchema);
  return category !== 'local_only';
}

/**
 * Get Supabase table name for a schema table
 */
export function getSupabaseTableName(key: string, tableSchema: TableDefinition): string {
  return tableSchema.supabaseTable || key;
}
