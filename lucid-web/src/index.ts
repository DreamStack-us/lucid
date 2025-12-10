/**
 * @dreamstack/lucid-web
 *
 * Browser-based store for Lucid.js using IndexedDB via localForage
 *
 * @example
 * ```ts
 * import { LocalForageStore } from '@dreamstack/lucid-web';
 * import { LucidProvider } from '@dreamstack/lucid-react';
 * import { lucidSchema } from './schema';
 *
 * const store = new LocalForageStore({
 *   name: 'myapp',
 *   debug: process.env.NODE_ENV === 'development',
 * });
 *
 * function App() {
 *   return (
 *     <LucidProvider schema={lucidSchema} store={store} connector={connector}>
 *       <MyApp />
 *     </LucidProvider>
 *   );
 * }
 * ```
 */

export { LocalForageStore, type LocalForageStoreOptions } from './LocalForageStore';
