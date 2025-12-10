/**
 * @dreamstack/lucid-react - Context
 *
 * React context and provider for Lucid.js
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import type {
  LucidSchema,
  LucidStore,
  LucidConnector,
  SyncStatus,
  UploadQueue,
  QueueProcessor,
} from '@dreamstack-us/lucid-core';

// ============================================================================
// Context Types
// ============================================================================

export interface LucidContextValue {
  /** The local store (SQLite, IndexedDB, etc.) */
  store: LucidStore;
  /** The schema definition */
  schema: LucidSchema;
  /** Upload queue for offline mutations */
  queue: UploadQueue;
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Whether the device is online */
  isOnline: boolean;
  /** Number of pending mutations in queue */
  pendingCount: number;
  /** Force a sync now */
  sync: () => Promise<void>;
}

export interface LucidProviderProps {
  children: ReactNode;
  /** The schema definition */
  schema: LucidSchema;
  /** The store implementation (from lucid-react-native or lucid-web) */
  store: LucidStore;
  /** The connector for syncing with backend */
  connector: LucidConnector;
  /** Called when online status changes */
  onOnlineChange?: (isOnline: boolean) => void;
}

// ============================================================================
// Context
// ============================================================================

const LucidContext = createContext<LucidContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function LucidProvider({
  children,
  schema,
  store,
  connector,
  onOnlineChange,
}: LucidProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: false,
    lastSyncedAt: null,
    uploading: false,
    downloading: false,
    error: null,
  });

  // Initialize store
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await store.initialize(schema);
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('[@dreamstack/lucid] Failed to initialize store:', error);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [store, schema]);

  // Create upload queue
  const queue = useMemo(() => {
    // Import dynamically to avoid circular deps
    const { UploadQueue } = require('@dreamstack-us/lucid-core');
    return new UploadQueue(store);
  }, [store]);

  // Update pending count when queue changes
  useEffect(() => {
    const updateCount = async () => {
      const count = await queue.getPendingCount();
      setPendingCount(count);
    };

    updateCount();
    return queue.subscribe(updateCount);
  }, [queue]);

  // Sync function
  const sync = useCallback(async () => {
    if (!isOnline) return;

    setSyncStatus((s) => ({ ...s, uploading: true }));

    try {
      const batch = await queue.getBatch();
      if (batch) {
        await connector.uploadData(batch);
      }
      setSyncStatus((s) => ({
        ...s,
        uploading: false,
        lastSyncedAt: Date.now(),
        error: null,
      }));
    } catch (error) {
      setSyncStatus((s) => ({
        ...s,
        uploading: false,
        error: error as Error,
      }));
    }
  }, [isOnline, queue, connector]);

  // Context value
  const value = useMemo<LucidContextValue | null>(() => {
    if (!isInitialized) return null;

    return {
      store,
      schema,
      queue,
      syncStatus,
      isOnline,
      pendingCount,
      sync,
    };
  }, [isInitialized, store, schema, queue, syncStatus, isOnline, pendingCount, sync]);

  if (!value) {
    return null; // Or a loading state
  }

  return (
    <LucidContext.Provider value={value}>
      {children}
    </LucidContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useLucid(): LucidContextValue {
  const context = useContext(LucidContext);
  if (!context) {
    throw new Error(
      'useLucid must be used within a LucidProvider. ' +
        'Make sure you have wrapped your app with <LucidProvider>.'
    );
  }
  return context;
}
