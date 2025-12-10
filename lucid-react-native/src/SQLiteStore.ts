/**
 * @dreamstack/lucid-react-native - SQLite Store
 *
 * expo-sqlite implementation of LucidStore
 */

import * as SQLite from 'expo-sqlite';
import type { SQLiteBindValue, SQLiteBindParams } from 'expo-sqlite';
import type { LucidStore, LucidSchema, CrudEntry, TableDefinition } from '@dreamstack-us/lucid-core';

const DB_NAME = 'lucid.db';

// Internal table names
const TABLES = {
  CRUD_QUEUE: 'lucid_crud_queue',
  SYNC_META: 'lucid_sync_meta',
} as const;

export class SQLiteStore implements LucidStore {
  private db: SQLite.SQLiteDatabase | null = null;
  private schema: LucidSchema | null = null;
  private initPromise: Promise<void> | null = null;

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
    this.db = await SQLite.openDatabaseAsync(DB_NAME);

    // Create internal tables
    await this.db.execAsync(`
      -- CRUD upload queue
      CREATE TABLE IF NOT EXISTS ${TABLES.CRUD_QUEUE} (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_crud_timestamp ON ${TABLES.CRUD_QUEUE}(timestamp);

      -- Sync metadata
      CREATE TABLE IF NOT EXISTS ${TABLES.SYNC_META} (
        table_name TEXT PRIMARY KEY,
        last_synced_at INTEGER
      );
    `);

    // Create tables for each schema entry
    for (const [tableName, tableSchema] of Object.entries(schema)) {
      await this.createTable(tableName, tableSchema);
    }
  }

  private async createTable(name: string, schema: TableDefinition): Promise<void> {
    const db = await this.getDb();

    // Build column definitions
    const columns = ['id TEXT PRIMARY KEY'];
    for (const [colName, colDef] of Object.entries(schema.columns)) {
      const sqlType = this.columnTypeToSQL(colDef.type);
      const nullable = colDef.nullable ? '' : ' NOT NULL';
      columns.push(`${colName} ${sqlType}${nullable}`);
    }

    // Add metadata columns
    columns.push('_synced INTEGER DEFAULT 0');
    columns.push('_updated_at INTEGER');

    const createSQL = `CREATE TABLE IF NOT EXISTS ${name} (${columns.join(', ')})`;
    await db.execAsync(createSQL);

    // Create indexes
    if (schema.indexes) {
      for (const [indexName, indexColumns] of Object.entries(schema.indexes)) {
        const indexSQL = `CREATE INDEX IF NOT EXISTS idx_${name}_${indexName} ON ${name}(${indexColumns.join(', ')})`;
        await db.execAsync(indexSQL);
      }
    }
  }

  private columnTypeToSQL(type: string): string {
    switch (type) {
      case 'text':
        return 'TEXT';
      case 'integer':
        return 'INTEGER';
      case 'real':
        return 'REAL';
      case 'blob':
        return 'BLOB';
      default:
        return 'TEXT';
    }
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      throw new Error('SQLiteStore not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD Operations
  // ─────────────────────────────────────────────────────────────────────────

  async get<T>(table: string, id: string): Promise<T | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return row ?? null;
  }

  async getAll<T>(table: string): Promise<T[]> {
    const db = await this.getDb();
    return db.getAllAsync<T>(`SELECT * FROM ${table}`);
  }

  async query<T>(table: string, where: Record<string, unknown>): Promise<T[]> {
    const db = await this.getDb();
    const conditions = Object.keys(where).map((k) => `${k} = ?`);
    const values = Object.values(where) as SQLiteBindValue[];
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return db.getAllAsync<T>(`SELECT * FROM ${table} ${whereClause}`, values);
  }

  async insert<T extends Record<string, unknown>>(table: string, data: T): Promise<void> {
    const db = await this.getDb();
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?');
    const values = Object.values(data) as SQLiteBindValue[];

    await db.runAsync(
      `INSERT INTO ${table} (${columns.join(', ')}, _updated_at) VALUES (${placeholders.join(', ')}, ?)`,
      [...values, Date.now()]
    );
  }

  async update(table: string, id: string, data: Record<string, unknown>): Promise<void> {
    const db = await this.getDb();
    const sets = Object.keys(data).map((k) => `${k} = ?`);
    const values = Object.values(data) as SQLiteBindValue[];

    await db.runAsync(
      `UPDATE ${table} SET ${sets.join(', ')}, _updated_at = ? WHERE id = ?`,
      [...values, Date.now(), id]
    );
  }

  async delete(table: string, id: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Bulk Operations (for sync)
  // ─────────────────────────────────────────────────────────────────────────

  async upsertBatch(table: string, rows: Record<string, unknown>[]): Promise<void> {
    if (rows.length === 0) return;

    const db = await this.getDb();

    // Get columns from first row
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?');

    // Use INSERT OR REPLACE for upsert
    const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}, _synced, _updated_at) VALUES (${placeholders.join(', ')}, 1, ?)`;

    for (const row of rows) {
      const values = columns.map((c) => row[c]) as SQLiteBindValue[];
      await db.runAsync(sql, [...values, Date.now()]);
    }
  }

  async deleteBatch(table: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const db = await this.getDb();
    const placeholders = ids.map(() => '?').join(', ');
    await db.runAsync(`DELETE FROM ${table} WHERE id IN (${placeholders})`, ids);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Queue Operations
  // ─────────────────────────────────────────────────────────────────────────

  async queueCrud(entry: CrudEntry): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT INTO ${TABLES.CRUD_QUEUE} (id, table_name, operation, data, timestamp) VALUES (?, ?, ?, ?, ?)`,
      [entry.id, entry.table, entry.operation, JSON.stringify(entry.data), entry.timestamp]
    );
  }

  async getQueuedCrud(limit = 100): Promise<CrudEntry[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<{
      id: string;
      table_name: string;
      operation: string;
      data: string;
      timestamp: number;
    }>(`SELECT * FROM ${TABLES.CRUD_QUEUE} ORDER BY timestamp ASC LIMIT ?`, [limit]);

    return rows.map((row) => ({
      id: row.id,
      table: row.table_name,
      operation: row.operation as CrudEntry['operation'],
      data: JSON.parse(row.data),
      timestamp: row.timestamp,
    }));
  }

  async removeFromQueue(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const db = await this.getDb();
    const placeholders = ids.map(() => '?').join(', ');
    await db.runAsync(`DELETE FROM ${TABLES.CRUD_QUEUE} WHERE id IN (${placeholders})`, ids);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Metadata
  // ─────────────────────────────────────────────────────────────────────────

  async getLastSyncedAt(table: string): Promise<number | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ last_synced_at: number | null }>(
      `SELECT last_synced_at FROM ${TABLES.SYNC_META} WHERE table_name = ?`,
      [table]
    );
    return row?.last_synced_at ?? null;
  }

  async setLastSyncedAt(table: string, timestamp: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO ${TABLES.SYNC_META} (table_name, last_synced_at) VALUES (?, ?)`,
      [table, timestamp]
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────

  async executeRaw<T>(sql: string, params: SQLiteBindValue[] = []): Promise<T[]> {
    const db = await this.getDb();
    return db.getAllAsync<T>(sql, params);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initPromise = null;
    }
  }
}
