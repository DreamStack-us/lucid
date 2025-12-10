# Project Context

## Overview

**Template**: DreamStack Monorepo
**Stack**: Next.js (web) + Tauri v2 (desktop) + Expo (mobile)

## Tech Stack

### Frontend Platforms
- **Web**: Next.js (TypeScript) - main web application
- **Desktop**: Tauri v2 (Rust + web frontend) - https://v2.tauri.app/start/
- **Mobile**: Expo/React Native (TypeScript) - iOS + Android with EAS

### Styling
- **Source of truth**: Tailwind CSS
- **Web/Desktop**: Tailwind CSS
- **Mobile**: NativeWind (Tailwind for React Native)

### Backend
- **API**: Next.js API Routes + tRPC
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Supabase

### API Clients
- **TypeScript**: tRPC client (type-safe, shared across web/desktop/mobile)

## Workspace Structure

```
dreamstack/
├── apps/
│   ├── desktop/          # Tauri v2 (wraps web frontend)
│   ├── native/           # Expo (iOS + Android)
│   └── web/              # Next.js (web + API)
├── packages/
│   ├── config/           # Shared Tailwind config
│   ├── db/               # Drizzle schema
│   ├── ui/               # Shared UI components
│   └── app/              # Shared business logic
├── package.json          # Node workspace
└── turbo.json            # Build orchestration
```

## Development Commands

```bash
# Desktop (Tauri v2)
yarn dev:desktop          # Desktop app with hot reload

# Web (Next.js)
yarn dev:web              # Web dev server

# Mobile (Expo)
yarn dev:native           # Mobile dev server

# All
yarn dev                  # Run everything
yarn build                # Build all
yarn typecheck            # Type check
```

## Current Priorities

<!-- Update this section with your current sprint items -->
- [ ] Priority 1
- [ ] Priority 2
- [ ] Priority 3

## Architecture Notes

### Tauri v2 Desktop App
- Uses web frontend (can share code with Next.js)
- Rust backend for native capabilities (file system, notifications, etc.)
- Cross-platform: macOS, Windows, Linux
- Smaller bundle size than Electron
- Documentation: https://v2.tauri.app/start/

### Code Sharing
- **Styling**: Tailwind classes shared across web/desktop
- **API types**: tRPC provides end-to-end type safety
- **UI Components**: Shared React components in `packages/ui`
- **Business logic**: Shared TypeScript in `packages/app`
