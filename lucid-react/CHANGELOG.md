# @dreamstack-us/lucid-react

## 0.0.5

### Patch Changes

- [`6a48cac`](https://github.com/DreamStack-us/lucid/commit/6a48cacd0d7551b4cc618c02767e281a1d8c4be2) Thanks [@hariDasu](https://github.com/hariDasu)! - Fix require() in context.tsx - changed dynamic require to static ESM import for UploadQueue. Fixes Turbopack compatibility.

## 0.0.4

### Patch Changes

- [#4](https://github.com/DreamStack-us/lucid/pull/4) [`b060a63`](https://github.com/DreamStack-us/lucid/commit/b060a6348fde63ceca5c35955fe9e5013d89360b) Thanks [@hariDasu](https://github.com/hariDasu)! - Fix ESM bundling for all packages. Adds `"type": "module"` and changes build output to use `.js` for ESM and `.cjs` for CommonJS. Fixes compatibility with Next.js 16 Turbopack.

- Updated dependencies [[`b060a63`](https://github.com/DreamStack-us/lucid/commit/b060a6348fde63ceca5c35955fe9e5013d89360b)]:
  - @dreamstack-us/lucid-core@0.0.4
