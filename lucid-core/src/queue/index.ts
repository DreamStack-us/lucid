/**
 * @dreamstack/lucid-core - Upload Queue
 *
 * FIFO queue for offline mutations, synced when online
 */

import type { CrudEntry, CrudBatch, CrudOperation, LucidStore } from '../types';

// ============================================================================
// Queue Manager
// ============================================================================

export class UploadQueue {
  private store: LucidStore;
  private processing = false;
  private listeners: Set<() => void> = new Set();

  constructor(store: LucidStore) {
    this.store = store;
  }

  /**
   * Add a mutation to the queue
   */
  async enqueue(
    table: string,
    operation: CrudOperation,
    data: Record<string, unknown>
  ): Promise<string> {
    const id = generateId();
    const entry: CrudEntry = {
      id,
      table,
      operation,
      data,
      timestamp: Date.now(),
    };

    await this.store.queueCrud(entry);
    this.notifyListeners();

    return id;
  }

  /**
   * Get a batch of queued mutations for processing
   */
  async getBatch(limit = 100): Promise<CrudBatch | null> {
    const entries = await this.store.getQueuedCrud(limit);

    if (entries.length === 0) {
      return null;
    }

    return {
      entries,
      complete: async () => {
        await this.store.removeFromQueue(entries.map((e) => e.id));
        this.notifyListeners();
      },
      abort: async () => {
        // Do nothing - entries remain in queue
      },
    };
  }

  /**
   * Check if there are pending changes
   */
  async hasPending(): Promise<boolean> {
    const entries = await this.store.getQueuedCrud(1);
    return entries.length > 0;
  }

  /**
   * Get count of pending changes
   */
  async getPendingCount(): Promise<number> {
    const entries = await this.store.getQueuedCrud();
    return entries.length;
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb());
  }
}

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================================================
// Queue Processor (runs when online)
// ============================================================================

export interface QueueProcessorOptions {
  /** Max entries per batch */
  batchSize?: number;
  /** Delay between batches (ms) */
  batchDelay?: number;
  /** Max retries per entry */
  maxRetries?: number;
  /** Retry delay (ms) */
  retryDelay?: number;
}

export class QueueProcessor {
  private queue: UploadQueue;
  private uploadFn: (batch: CrudBatch) => Promise<void>;
  private options: Required<QueueProcessorOptions>;
  private running = false;
  private abortController: AbortController | null = null;

  constructor(
    queue: UploadQueue,
    uploadFn: (batch: CrudBatch) => Promise<void>,
    options: QueueProcessorOptions = {}
  ) {
    this.queue = queue;
    this.uploadFn = uploadFn;
    this.options = {
      batchSize: options.batchSize ?? 100,
      batchDelay: options.batchDelay ?? 100,
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
    };
  }

  /**
   * Start processing the queue
   */
  async start(): Promise<void> {
    if (this.running) return;

    this.running = true;
    this.abortController = new AbortController();

    while (this.running) {
      try {
        const batch = await this.queue.getBatch(this.options.batchSize);

        if (!batch) {
          // No more entries, wait for new ones
          await this.waitForNewEntries();
          continue;
        }

        await this.processBatch(batch);

        // Small delay between batches
        await sleep(this.options.batchDelay);
      } catch (error) {
        if (this.abortController?.signal.aborted) {
          break;
        }
        console.error('[@dreamstack/lucid] Queue processing error:', error);
        await sleep(this.options.retryDelay);
      }
    }
  }

  /**
   * Stop processing the queue
   */
  stop(): void {
    this.running = false;
    this.abortController?.abort();
  }

  private async processBatch(batch: CrudBatch): Promise<void> {
    let retries = 0;

    while (retries < this.options.maxRetries) {
      try {
        await this.uploadFn(batch);
        await batch.complete();
        return;
      } catch (error) {
        retries++;
        console.warn(
          `[@dreamstack/lucid] Upload failed (attempt ${retries}/${this.options.maxRetries}):`,
          error
        );

        if (retries < this.options.maxRetries) {
          await sleep(this.options.retryDelay * retries);
        }
      }
    }

    // Max retries reached - abort batch (entries stay in queue)
    await batch.abort();
    throw new Error('Max retries reached for batch upload');
  }

  private async waitForNewEntries(): Promise<void> {
    return new Promise((resolve) => {
      const unsubscribe = this.queue.subscribe(() => {
        unsubscribe();
        resolve();
      });

      // Also resolve after timeout to check again
      setTimeout(() => {
        unsubscribe();
        resolve();
      }, 5000);
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
