# Codebase Overview

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  packages/config/global.css                 │
│                 (Uniwind CSS - Source of Truth)             │
├─────────────────────────────────────────────────────────────┤
│     DIOXUS (Rust)          │       EXPO (TypeScript)        │
│     Web + Desktop          │       iOS + Android            │
│     Tailwind built-in      │       Uniwind                  │
├─────────────────────────────────────────────────────────────┤
│                       NestJS API                            │
│                    Drizzle + Supabase                       │
└─────────────────────────────────────────────────────────────┘
```

## Key Directories

### apps/desktop/ (Dioxus)
Rust application targeting web (WASM) and desktop (native).

```
apps/desktop/
├── Cargo.toml          # Dependencies
├── Dioxus.toml         # Build config
└── src/
    └── main.rs         # Entry point
```

Key commands:
```bash
dx serve --platform desktop   # Desktop dev
dx serve --platform web       # Web dev (WASM)
dx build --release            # Production build
```

### apps/native/ (Expo)
React Native app with Uniwind for styling.

```
apps/native/
├── package.json
├── global.css          # Imports shared config
├── app/                # Expo Router
└── src/
```

Key commands:
```bash
expo start              # Dev server
eas build               # Cloud builds
eas update              # OTA updates
```

### packages/config/
Shared design tokens.

```
packages/config/
├── global.css          # Uniwind CSS (colors, spacing, etc.)
├── tailwind.config.ts  # Shared Tailwind config
└── package.json
```

### packages/api-client-rs/
Rust HTTP client for Dioxus apps.

```rust
use api_client::ApiClient;

let client = ApiClient::new("https://api.example.com")
    .with_token("bearer_token");

let data: MyType = client.get("/endpoint").await?;
```

### packages/api-client/
TypeScript HTTP client for Expo apps.

```typescript
import { createApiClient } from '@dreamstack/api-client';

const client = createApiClient({ baseUrl: 'https://api.example.com' });
const data = await client.get<MyType>('/endpoint');
```

## Styling Pattern

All platforms use Tailwind classes:

```tsx
// Expo (TSX)
<View className="bg-brand text-foreground p-4 rounded-lg">

// Dioxus (RSX)
rsx! {
    div { class: "bg-brand text-foreground p-4 rounded-lg",
        "Content"
    }
}
```

Tokens defined once in `global.css`:
```css
:root {
  --color-brand: #3B82F6;
  --color-background: #FFFFFF;
  --color-foreground: #18181B;

  @variant dark {
    --color-background: #09090B;
    --color-foreground: #FAFAFA;
  }
}
```

## Build Pipeline

```bash
# TurboRepo orchestrates TypeScript builds
turbo build

# Cargo handles Rust builds
cargo build --release

# Combined via package.json scripts
yarn build              # All platforms
yarn build:desktop      # Dioxus only
```

## Testing

```bash
# TypeScript
yarn test               # Jest
yarn typecheck          # TSC

# Rust
cargo test              # Unit tests
cargo clippy            # Linting
```

## Deployment

- **Web (Dioxus WASM)**: Static hosting (Vercel, Cloudflare)
- **Desktop (Dioxus native)**: GitHub Releases, auto-updater
- **Mobile (Expo)**: EAS Build + EAS Update for OTA
- **API (NestJS)**: Docker, Railway, Fly.io
