<p align="center">
  <img src="docs/logo.png" alt="Lucid.js" width="480">
</p>

<h1 align="center">Lucid.js</h1>

<p align="center">Offline-first data layer for React Native and Web.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@dreamstack-us/lucid-core"><img src="https://img.shields.io/npm/v/@dreamstack-us/lucid-core?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/DreamStack-us/lucid/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://github.com/DreamStack-us/lucid"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs welcome"></a>
</p>

> **Status:** Pre-release. Testing in internal projects before public release.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@dreamstack-us/lucid-core`](https://www.npmjs.com/package/@dreamstack-us/lucid-core) | [![npm](https://img.shields.io/npm/v/@dreamstack-us/lucid-core)](https://www.npmjs.com/package/@dreamstack-us/lucid-core) | Core engine - types, schema API, upload queue |
| [`@dreamstack-us/lucid-react`](https://www.npmjs.com/package/@dreamstack-us/lucid-react) | [![npm](https://img.shields.io/npm/v/@dreamstack-us/lucid-react)](https://www.npmjs.com/package/@dreamstack-us/lucid-react) | React bindings - LucidProvider, hooks |
| [`@dreamstack-us/lucid-react-native`](https://www.npmjs.com/package/@dreamstack-us/lucid-react-native) | [![npm](https://img.shields.io/npm/v/@dreamstack-us/lucid-react-native)](https://www.npmjs.com/package/@dreamstack-us/lucid-react-native) | React Native SQLite store (expo-sqlite) |
| [`@dreamstack-us/lucid-supabase`](https://www.npmjs.com/package/@dreamstack-us/lucid-supabase) | [![npm](https://img.shields.io/npm/v/@dreamstack-us/lucid-supabase)](https://www.npmjs.com/package/@dreamstack-us/lucid-supabase) | Supabase connector and sync manager |
| [`@dreamstack-us/lucid-web`](https://www.npmjs.com/package/@dreamstack-us/lucid-web) | [![npm](https://img.shields.io/npm/v/@dreamstack-us/lucid-web)](https://www.npmjs.com/package/@dreamstack-us/lucid-web) | Browser store (IndexedDB via localForage) |
| [`@dreamstack-us/lucid-trpc`](https://www.npmjs.com/package/@dreamstack-us/lucid-trpc) | [![npm](https://img.shields.io/npm/v/@dreamstack-us/lucid-trpc)](https://www.npmjs.com/package/@dreamstack-us/lucid-trpc) | tRPC connector for bidirectional sync |

## Philosophy

- **Local-first**: SQLite is the primary data source, API is for sync
- **Smart caching**: Data categories determine cache/fetch strategy
- **Offline mutations**: Changes queued locally, uploaded when online
- **Type-safe**: Full TypeScript support with schema-driven types

## Data Categories

```typescript
import { schema, table, column } from '@dreamstack-us/lucid-core';

export const mySchema = schema({
  // Reference data - time-based cache (24h), background sync
  products: table({
    name: column.text,
    price: column.real,
  }).reference('24h', { backgroundSync: true }),

  // User-owned data - always show cached, sync on focus/reconnect
  orders: table({
    productId: column.text,
    quantity: column.integer,
  }).userOwned({ syncOnFocus: true, syncOnReconnect: true }),

  // Local-only - never synced to server
  cart: table({
    productId: column.text,
    quantity: column.integer,
  }).localOnly(),
});
```

## Quick Start

```typescript
// App.tsx
import { LucidProvider } from '@dreamstack-us/lucid-react';
import { SQLiteStore } from '@dreamstack-us/lucid-react-native';
import { mySchema } from './schema';

const store = new SQLiteStore();

export default function App() {
  return (
    <LucidProvider schema={mySchema} store={store}>
      <MyApp />
    </LucidProvider>
  );
}

// Component.tsx
import { useLucidQuery, useLucidMutation } from '@dreamstack-us/lucid-react';

function ProductList() {
  const { data: products, isLoading } = useLucidQuery('products');
  const { mutate: createOrder } = useLucidMutation('orders');

  // products are served from local SQLite
  // createOrder queues locally, uploads when online
}
```

## License

MIT
