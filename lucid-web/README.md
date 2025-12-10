# @dreamstack-us/lucid-web

Browser-based store for [Lucid.js](https://github.com/dreamstack-us/lucid) using IndexedDB via localForage.

## Installation

```bash
npm install @dreamstack-us/lucid-web @dreamstack-us/lucid-core localforage
```

## Usage

```typescript
import { LocalForageStore } from '@dreamstack-us/lucid-web';
import { LucidProvider } from '@dreamstack-us/lucid-react';
import { lucidSchema } from './schema';

// Create store instance
const store = new LocalForageStore({
  name: 'myapp',
  debug: process.env.NODE_ENV === 'development',
});

// Use with LucidProvider
function App() {
  return (
    <LucidProvider schema={lucidSchema} store={store} connector={connector}>
      <MyApp />
    </LucidProvider>
  );
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | `'lucid'` | Database name |
| `storePrefix` | `string` | `'lucid_'` | Prefix for table store names |
| `driver` | `string[]` | - | Driver preference order (IndexedDB, WebSQL, localStorage) |
| `debug` | `boolean` | `false` | Enable debug logging |

## API

### LucidStore Interface

The `LocalForageStore` implements the full `LucidStore` interface from `@dreamstack-us/lucid-core`:

```typescript
interface LucidStore {
  // Initialize
  initialize(schema: LucidSchema): Promise<void>;

  // CRUD
  get<T>(table: string, id: string): Promise<T | null>;
  getAll<T>(table: string): Promise<T[]>;
  query<T>(table: string, where: Record<string, unknown>): Promise<T[]>;
  insert<T>(table: string, data: T): Promise<void>;
  update(table: string, id: string, data: Record<string, unknown>): Promise<void>;
  delete(table: string, id: string): Promise<void>;

  // Bulk
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
```

### Additional Methods

```typescript
// Clear a specific table
await store.clearTable('posts');

// Clear all data
await store.clearAll();

// Get pending changes count
const count = await store.getPendingCount();

// Check for pending changes
const hasPending = await store.hasPendingChanges();
```

## Storage Structure

Data is stored in separate IndexedDB object stores:

- `lucid_<tableName>` - One store per schema table
- `lucid_crud_queue` - Pending mutations queue
- `lucid_sync_meta` - Sync timestamps per table

## Browser Support

Uses [localForage](https://localforage.github.io/localForage/) which supports:
- IndexedDB (preferred)
- WebSQL (fallback)
- localStorage (fallback)

## License

MIT
