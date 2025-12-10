# @dreamstack-us/lucid-trpc

tRPC connector for [Lucid.js](https://github.com/dreamstack-us/lucid) - bidirectional sync with tRPC backends.

## Installation

```bash
npm install @dreamstack-us/lucid-trpc @dreamstack-us/lucid-core @trpc/client
```

## Usage

### Basic Setup

```typescript
import { createTrpcConnector, TrpcSyncManager } from '@dreamstack-us/lucid-trpc';
import { LocalForageStore } from '@dreamstack-us/lucid-web';
import { LucidProvider } from '@dreamstack-us/lucid-react';
import { trpcClient } from './trpc';
import { lucidSchema } from './schema';
import { useAuthStore } from './stores';

// Create store
const store = new LocalForageStore({ name: 'myapp' });

// Create connector
const connector = createTrpcConnector({
  client: trpcClient,
  schema: lucidSchema,
  store,
  routerMap: {
    posts: 'posts',
    tags: 'tags',
  },
  getAccessToken: () => useAuthStore.getState().getAccessToken(),
});

// Create sync manager
const syncManager = new TrpcSyncManager({
  connector,
  schema: lucidSchema,
  store,
  syncInterval: 30000, // 30 seconds
});

// Start sync on app mount
syncManager.start();

// In React
function App() {
  return (
    <LucidProvider schema={lucidSchema} store={store} connector={connector}>
      <MyApp />
    </LucidProvider>
  );
}
```

## Connector Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `client` | `TrpcClientLike` | required | tRPC client instance |
| `schema` | `LucidSchema` | required | Lucid schema |
| `store` | `LucidStore` | required | Local store instance |
| `routerMap` | `Record<string, string>` | required | Map Lucid tables to tRPC routers |
| `procedureMap` | `ProcedureMap` | `{ insert: 'create', update: 'update', delete: 'delete' }` | Procedure names |
| `fetchProcedure` | `string` | `'list'` | Query procedure for downloads |
| `transformUpload` | `function` | - | Transform data before upload |
| `transformDownload` | `function` | - | Transform data after download |
| `getAccessToken` | `function` | - | Auth token getter |
| `debug` | `boolean` | `false` | Enable logging |

## tRPC Router Requirements

Your tRPC routers should implement these procedures:

```typescript
// Example posts router
export const postsRouter = router({
  // For downloads (fetchProcedure)
  list: publicProcedure
    .input(z.object({
      updatedAfter: z.string().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      // Return array of posts
    }),

  // For uploads (procedureMap)
  create: protectedProcedure
    .input(postSchema)
    .mutation(async ({ input }) => {
      // Insert new post
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), ...partialPostSchema }))
    .mutation(async ({ input }) => {
      // Update existing post
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Delete post
    }),
});
```

## Sync Manager

The `TrpcSyncManager` handles periodic background sync:

```typescript
const syncManager = new TrpcSyncManager({
  connector,
  schema: lucidSchema,
  store,
  syncInterval: 30000, // 30 seconds
  tables: ['posts', 'tags'], // Optional: specific tables
  debug: true,
});

// Start syncing
await syncManager.start();

// Force sync a table
await syncManager.forceSync('posts');

// Force sync all
await syncManager.forceSyncAll();

// Get sync status
const status = await syncManager.getSyncStatus();
// { posts: { lastSyncedAt: 1699999999999, isSynced: true }, ... }

// Stop syncing
syncManager.stop();
```

## Data Transformation

Transform data between Lucid and tRPC formats:

```typescript
const connector = createTrpcConnector({
  // ...
  transformUpload: (table, operation, data) => {
    // Convert camelCase to snake_case for server
    return {
      ...data,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
    };
  },
  transformDownload: (table, data) => {
    // Convert snake_case to camelCase from server
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
});
```

## How It Works

### Upload Flow (Local -> Server)

1. Mutations are queued locally via `LucidStore.queueCrud()`
2. `QueueProcessor` calls `connector.uploadData()` with batches
3. Connector maps table to tRPC router via `routerMap`
4. Calls appropriate mutation (`create`, `update`, `delete`)
5. On success, removes entries from queue

### Download Flow (Server -> Local)

1. `TrpcSyncManager.syncTable()` is called periodically
2. Calls `connector.fetchData()` with `since` timestamp
3. Connector calls tRPC query (default: `list`)
4. Results are written to local store via `store.upsertBatch()`
5. Sync timestamp is updated via `store.setLastSyncedAt()`

## License

MIT
