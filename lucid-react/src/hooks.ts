/**
 * @dreamstack/lucid-react - Hooks
 *
 * React hooks for querying and mutating local-first data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLucid } from './context';
import type { CrudOperation } from '@dreamstack/lucid-core';

// ============================================================================
// useLucidQuery - Read data from local store
// ============================================================================

export interface UseLucidQueryOptions<T> {
  /** Don't run the query automatically */
  enabled?: boolean;
  /** Transform the result */
  select?: (data: T[]) => T[];
}

export interface UseLucidQueryResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Query data from the local SQLite store
 *
 * @example
 * ```tsx
 * const { data: products, isLoading } = useLucidQuery('products');
 * const { data: orders } = useLucidQuery('orders', {
 *   select: (orders) => orders.filter(o => o.status === 'pending')
 * });
 * ```
 */
export function useLucidQuery<T>(
  table: string,
  options: UseLucidQueryOptions<T> = {}
): UseLucidQueryResult<T> {
  const { store } = useLucid();
  const { enabled = true, select } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      let result = await store.getAll<T>(table);
      if (select) {
        result = select(result);
      }
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [store, table, enabled, select]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

// ============================================================================
// useLucidQueryOne - Read a single record
// ============================================================================

export interface UseLucidQueryOneResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Query a single record by ID
 *
 * @example
 * ```tsx
 * const { data: product } = useLucidQueryOne('products', productId);
 * ```
 */
export function useLucidQueryOne<T>(
  table: string,
  id: string | null
): UseLucidQueryOneResult<T> {
  const { store } = useLucid();

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await store.get<T>(table, id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [store, table, id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

// ============================================================================
// useLucidMutation - Write data with offline queue
// ============================================================================

export interface UseLucidMutationResult<T, TInput> {
  mutate: (input: TInput) => void;
  mutateAsync: (input: TInput) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export interface MutationOptions<T> {
  /** Called on success */
  onSuccess?: (data: T) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

/**
 * Create a mutation that writes to local store and queues for sync
 *
 * @example
 * ```tsx
 * const { mutate: createOrder } = useLucidMutation('orders', 'INSERT');
 *
 * createOrder({
 *   product_id: '123',
 *   quantity: 2,
 * });
 * ```
 */
export function useLucidMutation<T extends Record<string, unknown>, TInput = Omit<T, 'id'>>(
  table: string,
  operation: CrudOperation,
  options: MutationOptions<T> = {}
): UseLucidMutationResult<T, TInput> {
  const { store, queue } = useLucid();
  const { onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (input: TInput): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        let result: T;
        const id = (input as any).id || generateId();
        const data = { ...input, id } as T;

        switch (operation) {
          case 'INSERT':
            await store.insert(table, data);
            result = data;
            break;
          case 'UPDATE':
            await store.update(table, id, input as Record<string, unknown>);
            result = data;
            break;
          case 'DELETE':
            await store.delete(table, id);
            result = data;
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        // Queue for sync
        await queue.enqueue(table, operation, data as Record<string, unknown>);

        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [store, queue, table, operation, onSuccess, onError]
  );

  const mutate = useCallback(
    (input: TInput) => {
      mutateAsync(input).catch(() => {
        // Error already handled
      });
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { mutate, mutateAsync, isLoading, error, reset };
}

// ============================================================================
// useLucidWatch - Reactive query (re-runs when data changes)
// ============================================================================

// TODO: Implement with SQLite change notifications
// export function useLucidWatch<T>(table: string): T[] { }

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
