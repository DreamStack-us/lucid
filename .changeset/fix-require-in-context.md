---
"@dreamstack-us/lucid-react": patch
---

Fix require() in context.tsx - changed dynamic require to static ESM import for UploadQueue. Fixes Turbopack compatibility.
