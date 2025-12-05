<h1 align="center">Lucid.js</h1>

<p align="center">Offline-first data layer for React Native and Web.</p>

> **Status:** Pre-release. Testing in internal projects before public release.

## Packages

| Package | Description |
|---------|-------------|
| `@dreamstack/lucid-core` | Core engine - types, schema API, upload queue |
| `@dreamstack/lucid-react` | React bindings - LucidProvider, hooks |
| `@dreamstack/lucid-react-native` | React Native SQLite store (expo-sqlite) |
| `@dreamstack/lucid-supabase` | Supabase connector and sync manager |

## Philosophy

- **Local-first**: SQLite is the primary data source, API is for sync
- **Smart caching**: Data categories determine cache/fetch strategy
- **Offline mutations**: Changes queued locally, uploaded when online
- **Type-safe**: Full TypeScript support with schema-driven types

## Data Categories

```typescript
import { schema, table, column } from '@dreamstack/lucid-core';

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
import { LucidProvider } from '@dreamstack/lucid-react';
import { SQLiteStore } from '@dreamstack/lucid-react-native';
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
import { useLucidQuery, useLucidMutation } from '@dreamstack/lucid-react';

function ProductList() {
  const { data: products, isLoading } = useLucidQuery('products');
  const { mutate: createOrder } = useLucidMutation('orders');

  // products are served from local SQLite
  // createOrder queues locally, uploads when online
}
```

## License

MIT
