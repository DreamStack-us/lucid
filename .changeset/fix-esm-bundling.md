---
"@dreamstack-us/lucid-core": patch
"@dreamstack-us/lucid-react": patch
"@dreamstack-us/lucid-react-native": patch
"@dreamstack-us/lucid-supabase": patch
"@dreamstack-us/lucid-web": patch
"@dreamstack-us/lucid-trpc": patch
---

Fix ESM bundling for all packages. Adds `"type": "module"` and changes build output to use `.js` for ESM and `.cjs` for CommonJS. Fixes compatibility with Next.js 16 Turbopack.
