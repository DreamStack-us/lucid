# Project Context

## Overview

**Project**: Lucid.js - Offline-first data layer for React Native and Web
**Organization**: DreamStack

## Tech Stack

### Build & Tooling
- **Package Manager**: Bun
- **Bundler**: tsup
- **Versioning**: Changesets
- **CI/CD**: GitHub Actions with npm OIDC Trusted Publishers

### Languages
- **TypeScript**: All packages

## Workspace Structure

```
lucid/
├── lucid-core/           # Core types, schema API, upload queue
├── lucid-react/          # React context, hooks (LucidProvider)
├── lucid-react-native/   # expo-sqlite store implementation
├── lucid-supabase/       # Supabase connector and sync
├── lucid-web/            # Browser store (IndexedDB via localForage)
├── lucid-trpc/           # tRPC connector for bidirectional sync
├── .changeset/           # Version management
└── .github/workflows/    # CI + Release automation
```

## Development Commands

```bash
# Install
bun install

# Build all packages (core first, then others)
bun run build

# Type check
bun run typecheck

# Clean
bun run clean

# Create changeset for release
bun changeset
```

## Package Dependencies

```
lucid-core (no deps)
    ↓
├── lucid-react
├── lucid-react-native
├── lucid-supabase
├── lucid-web
└── lucid-trpc
```

## Current Priorities

- Maintain ESM-first builds for all packages
- Ensure compatibility with Next.js Turbopack
- Keep TypeScript types in sync across packages
