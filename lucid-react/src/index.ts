/**
 * @dreamstack/lucid-react
 *
 * React hooks and provider for Lucid.js
 *
 * @example
 * ```tsx
 * import { LucidProvider, useLucidQuery, useLucidMutation } from '@dreamstack/lucid-react';
 * import { SQLiteStore } from '@dreamstack/lucid-react-native';
 * import { createSupabaseConnector } from '@dreamstack/lucid-supabase';
 *
 * const store = new SQLiteStore();
 * const connector = createSupabaseConnector(supabaseClient);
 *
 * function App() {
 *   return (
 *     <LucidProvider store={store} schema={schema} connector={connector}>
 *       <MyApp />
 *     </LucidProvider>
 *   );
 * }
 *
 * function ProductList() {
 *   const { data: products, isLoading } = useLucidQuery('products');
 *   const { mutate: createProduct } = useLucidMutation('products', 'INSERT');
 *
 *   return <List data={products} />;
 * }
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export {
  LucidProvider,
  useLucid,
  type LucidProviderProps,
  type LucidContextValue,
} from './context';

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────
export {
  useLucidQuery,
  useLucidQueryOne,
  useLucidMutation,
  type UseLucidQueryOptions,
  type UseLucidQueryResult,
  type UseLucidQueryOneResult,
  type UseLucidMutationResult,
  type MutationOptions,
} from './hooks';
