# Codebase Overview

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     @dreamstack-us/lucid-core               │
│              (Types, Schema API, Upload Queue)              │
├─────────────────────────────────────────────────────────────┤
│  lucid-react    │  lucid-react-native  │    lucid-web       │
│  (Hooks/Context)│  (expo-sqlite Store) │ (localForage Store)│
├─────────────────────────────────────────────────────────────┤
│          lucid-supabase          │      lucid-trpc          │
│        (Supabase Connector)      │   (tRPC Connector)       │
└─────────────────────────────────────────────────────────────┘
```

## Key Directories

### lucid-core/
Core types, schema builder, and upload queue.

```
lucid-core/
├── src/
│   ├── index.ts          # Main exports
│   ├── schema/           # Schema builder API
│   └── types/            # TypeScript types
├── tsup.config.ts        # Build config
└── package.json
```

### lucid-react/
React bindings with context and hooks.

```
lucid-react/
├── src/
│   ├── index.ts          # Exports
│   ├── context.tsx       # LucidProvider
│   └── hooks.ts          # useLucidQuery, useLucidMutation
└── package.json
```

### lucid-web/
Browser storage using IndexedDB via localForage.

```
lucid-web/
├── src/
│   ├── index.ts
│   └── LocalForageStore.ts
└── package.json
```

### lucid-react-native/
React Native storage using expo-sqlite.

```
lucid-react-native/
├── src/
│   ├── index.ts
│   └── SQLiteStore.ts
└── package.json
```

## Build Configuration

All packages use tsup with ESM-first output:

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["@dreamstack-us/lucid-core", ...peerDeps],
});
```

## Package.json Pattern

```json
{
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "exports": {
    ".": {
      "import": { "default": "./dist/index.js" },
      "require": { "default": "./dist/index.cjs" }
    }
  }
}
```

## Build Pipeline

```bash
# Build order matters - core first
bun run --cwd lucid-core build
bun run --filter '!@dreamstack-us/lucid-core' build
```

## Release Process

1. `bun changeset` - Create changeset
2. Push to main
3. Changesets action creates Version Packages PR
4. Merge PR → auto-publish via OIDC
