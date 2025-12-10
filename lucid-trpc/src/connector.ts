/**
 * @dreamstack/lucid-trpc - Connector
 *
 * tRPC connector for bidirectional sync with Lucid.js
 */

import type { CrudBatch } from '@dreamstack-us/lucid-core';
import { shouldSync, getTableCategory } from '@dreamstack-us/lucid-core';
import type {
  TrpcConnectorOptions,
  LucidBidirectionalConnector,
  FetchOptions,
  ProcedureMap,
} from './types';

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_PROCEDURE_MAP: Required<ProcedureMap> = {
  insert: 'create',
  update: 'update',
  delete: 'delete',
};

const DEFAULT_FETCH_PROCEDURE = 'list';

// ============================================================================
// Connector Factory
// ============================================================================

/**
 * Create a tRPC connector for Lucid.js
 *
 * @example
 * ```ts
 * const connector = createTrpcConnector({
 *   client: trpcClient,
 *   schema: lucidSchema,
 *   store: localForageStore,
 *   routerMap: {
 *     posts: 'posts',
 *     tags: 'tags',
 *   },
 *   getAccessToken: () => authStore.getState().token,
 * });
 * ```
 */
export function createTrpcConnector(
  options: TrpcConnectorOptions
): LucidBidirectionalConnector {
  const {
    client,
    schema,
    store,
    routerMap,
    procedureMap = {},
    fetchProcedure = DEFAULT_FETCH_PROCEDURE,
    transformUpload,
    transformDownload,
    getAccessToken,
    debug = false,
  } = options;

  // Merge procedure maps
  const procedures: Required<ProcedureMap> = {
    ...DEFAULT_PROCEDURE_MAP,
    ...procedureMap,
  };

  const log = (...args: unknown[]) => {
    if (debug) {
      console.log('[@dreamstack/lucid-trpc]', ...args);
    }
  };

  /**
   * Get the procedure name for an operation
   */
  const getProcedureName = (operation: 'INSERT' | 'UPDATE' | 'DELETE'): string => {
    switch (operation) {
      case 'INSERT':
        return procedures.insert;
      case 'UPDATE':
        return procedures.update;
      case 'DELETE':
        return procedures.delete;
    }
  };

  /**
   * Get the tRPC router for a table
   */
  const getRouter = (table: string) => {
    const routerPath = routerMap[table];
    if (!routerPath) {
      throw new Error(`No router mapping for table: ${table}`);
    }

    const router = client[routerPath];
    if (!router) {
      throw new Error(`Router not found: ${routerPath}`);
    }

    return { router, routerPath };
  };

  /**
   * Call a tRPC mutation
   */
  const callMutation = async (
    routerPath: string,
    procedureName: string,
    data: Record<string, unknown>
  ) => {
    const router = client[routerPath] as Record<string, { mutate?: (input: unknown) => Promise<unknown> }>;
    const procedure = router[procedureName];

    if (!procedure || !procedure.mutate) {
      throw new Error(`Mutation not found: ${routerPath}.${procedureName}`);
    }

    return procedure.mutate(data);
  };

  /**
   * Call a tRPC query
   */
  const callQuery = async (
    routerPath: string,
    procedureName: string,
    input?: Record<string, unknown>
  ) => {
    const router = client[routerPath] as Record<string, { query?: (input?: unknown) => Promise<unknown> }>;
    const procedure = router[procedureName];

    if (!procedure || !procedure.query) {
      throw new Error(`Query not found: ${routerPath}.${procedureName}`);
    }

    return procedure.query(input);
  };

  return {
    /**
     * Upload local changes to tRPC backend
     */
    async uploadData(batch: CrudBatch): Promise<void> {
      log(`Uploading batch of ${batch.entries.length} entries`);

      try {
        for (const entry of batch.entries) {
          const tableSchema = schema[entry.table];

          // Skip local_only tables
          if (!tableSchema || !shouldSync(tableSchema)) {
            log(`Skipping ${entry.table} - not synced`);
            continue;
          }

          const { routerPath } = getRouter(entry.table);
          const procedureName = getProcedureName(entry.operation);

          // Transform data if needed
          const data = transformUpload
            ? transformUpload(entry.table, entry.operation, entry.data)
            : entry.data;

          log(`${entry.operation} on ${routerPath}.${procedureName}:`, data);

          try {
            switch (entry.operation) {
              case 'INSERT': {
                await callMutation(routerPath, procedureName, data);
                break;
              }
              case 'UPDATE': {
                // Include id in update payload
                await callMutation(routerPath, procedureName, {
                  id: entry.data.id,
                  ...data,
                });
                break;
              }
              case 'DELETE': {
                // Only send id for delete
                await callMutation(routerPath, procedureName, { id: entry.data.id });
                break;
              }
            }
          } catch (error) {
            console.error(
              `[@dreamstack/lucid-trpc] Failed to ${entry.operation} on ${routerPath}.${procedureName}:`,
              error
            );
            throw error;
          }
        }

        // Mark batch complete
        await batch.complete();
        log('Batch upload complete');
      } catch (error) {
        // Don't call complete() on error - entries stay queued for retry
        throw error;
      }
    },

    /**
     * Fetch data from tRPC backend
     */
    async fetchData(
      table: string,
      options?: FetchOptions
    ): Promise<Record<string, unknown>[]> {
      const tableSchema = schema[table];

      // Skip local_only tables
      if (!tableSchema || !shouldSync(tableSchema)) {
        log(`Skipping ${table} - not synced`);
        return [];
      }

      const { routerPath } = getRouter(table);

      // Build query input based on options
      const input: Record<string, unknown> = {};

      if (options?.since) {
        // For incremental sync - tRPC procedure should support 'updatedAfter' filter
        input.updatedAfter = new Date(options.since).toISOString();
      }

      if (options?.limit) {
        input.limit = options.limit;
      }

      if (options?.where) {
        Object.assign(input, options.where);
      }

      log(`Fetching ${table} from ${routerPath}.${fetchProcedure}:`, input);

      try {
        // Call tRPC query
        const data = await callQuery(
          routerPath,
          fetchProcedure,
          Object.keys(input).length > 0 ? input : undefined
        );

        if (!Array.isArray(data)) {
          log(`Warning: ${routerPath}.${fetchProcedure} did not return an array`);
          return [];
        }

        // Transform downloaded data
        const transformed = data.map((record) =>
          transformDownload
            ? transformDownload(table, record as Record<string, unknown>)
            : (record as Record<string, unknown>)
        );

        log(`Received ${transformed.length} rows for ${table}`);

        // Write to local store
        if (transformed.length > 0) {
          await store.upsertBatch(table, transformed);
        }

        // Update sync timestamp
        await store.setLastSyncedAt(table, Date.now());

        return transformed;
      } catch (error) {
        console.error(
          `[@dreamstack/lucid-trpc] Failed to fetch ${table}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Fetch credentials for authorization
     */
    async fetchCredentials() {
      const token = getAccessToken?.();

      if (!token) {
        throw new Error('No access token available');
      }

      return {
        accessToken: token,
        // Note: JWT expiry parsing would require jwt-decode dependency
        // Users can implement this in their own getAccessToken if needed
      };
    },
  };
}
