# Lucid.js

Offline-first data layer for React Native and Web.

## Tech Stack

- **Build**: Bun + tsup
- **Language**: TypeScript
- **Versioning**: Changesets
- **CI/CD**: GitHub Actions with npm OIDC Trusted Publishers

## Packages

| Package | Description |
|---------|-------------|
| `@dreamstack-us/lucid-core` | Core engine - types, schema API, upload queue |
| `@dreamstack-us/lucid-react` | React bindings - LucidProvider, hooks |
| `@dreamstack-us/lucid-react-native` | React Native SQLite store (expo-sqlite) |
| `@dreamstack-us/lucid-supabase` | Supabase connector and sync manager |
| `@dreamstack-us/lucid-web` | Browser store (IndexedDB via localForage) |
| `@dreamstack-us/lucid-trpc` | tRPC connector for bidirectional sync |

## Workspace Structure

```
lucid/
├── lucid-core/           # Core types, schema, queue
├── lucid-react/          # React context, hooks
├── lucid-react-native/   # expo-sqlite store
├── lucid-supabase/       # Supabase connector
├── lucid-web/            # localForage store
├── lucid-trpc/           # tRPC connector
├── .changeset/           # Version management
└── .github/workflows/    # CI + Release
```

## Commands

```bash
bun install              # Install deps
bun run build            # Build all packages
bun run typecheck        # Type check
bun changeset            # Create changeset for release
```

## Build Order

lucid-core must build first (others depend on it):
```bash
bun run --cwd lucid-core build && bun run --filter '!@dreamstack-us/lucid-core' build
```

## ESM Configuration

All packages are ESM-first:
- `"type": "module"` in package.json
- `.js` for ESM, `.cjs` for CommonJS
- Proper `exports` field with import/require conditions

## Release Process

1. Make changes
2. Run `bun changeset` to describe changes
3. Commit and push to main
4. Changesets action creates "Version Packages" PR
5. Merge PR → auto-publishes to npm via OIDC
