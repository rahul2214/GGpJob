/**
 * High-Performance Two-Tier Cache with Upstash Redis L2 & In-Memory L1.
 * - L1: Sub-millisecond in-memory cache with LRU memory ceiling (10,000 items)
 * - L2: Distributed Upstash Redis (REST API) for sharing cache across autoscaled nodes
 * - Stampede / Thundering-Herd Protection: Concurrent duplicate reads coalesce into 1 fetcher
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class MultiTierCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private inFlight: Map<string, Promise<any>> = new Map();
  private maxItems: number;

  constructor(maxItems = 10000) {
    this.maxItems = maxItems;
  }

  private getUpstashConfig() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token && url.startsWith('http')) {
      return { url: url.replace(/\/+$/, ''), token };
    }
    return null;
  }

  private async fetchUpstash(endpoint: string, options?: RequestInit): Promise<any> {
    const conf = this.getUpstashConfig();
    if (!conf) return null;

    try {
      const res = await fetch(`${conf.url}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${conf.token}`,
          ...(options?.headers || {}),
        },
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.result ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Fast synchronous read from in-memory L1 cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  /**
   * Set data in L1 memory cache, and asynchronously persist to Upstash L2 Redis if available
   */
  set(key: string, data: any, ttlMs: number = 300000): void {
    const now = Date.now();

    // Enforce hard memory ceiling on L1
    if (this.cache.size >= this.maxItems) {
      for (const [k, v] of this.cache.entries()) {
        if (now > v.expiry) {
          this.cache.delete(k);
        }
      }

      if (this.cache.size >= this.maxItems) {
        let dropped = 0;
        const targetDrop = Math.floor(this.maxItems * 0.2);
        for (const k of this.cache.keys()) {
          this.cache.delete(k);
          if (++dropped >= targetDrop) break;
        }
      }
    }

    this.cache.set(key, {
      data,
      expiry: now + ttlMs,
    });

    // Write to Upstash L2 in background (non-blocking)
    const conf = this.getUpstashConfig();
    if (conf) {
      const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
      this.fetchUpstash(`/set/${encodeURIComponent(key)}?ex=${ttlSec}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
    }
  }

  /**
   * Single-flight cache read with two-tier lookup (L1 -> L2 -> fetcher)
   * and thundering-herd / stampede prevention.
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 300000): Promise<T> {
    // 1. Check L1 Memory cache
    const l1Cached = this.get<T>(key);
    if (l1Cached !== null) {
      return l1Cached;
    }

    // 2. Coalesce concurrent duplicate requests
    const existingPromise = this.inFlight.get(key);
    if (existingPromise) {
      return existingPromise as Promise<T>;
    }

    const promise = (async () => {
      try {
        // 3. Check L2 Upstash Redis if configured
        const conf = this.getUpstashConfig();
        if (conf) {
          try {
            const raw = await this.fetchUpstash(`/get/${encodeURIComponent(key)}`);
            if (raw !== null && raw !== undefined) {
              const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
              // Populate L1 cache for subsequent fast reads
              this.set(key, parsed, ttlMs);
              return parsed as T;
            }
          } catch {
            // Redis read failure fallback to primary fetcher
          }
        }

        // 4. Cache miss: execute fetcher
        const result = await fetcher();
        this.set(key, result, ttlMs);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Delete data from both L1 and L2
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.inFlight.delete(key);

    const conf = this.getUpstashConfig();
    if (conf) {
      this.fetchUpstash(`/del/${encodeURIComponent(key)}`).catch(() => {});
    }
  }

  /**
   * Clear in-memory cache
   */
  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  /**
   * Current L1 cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Backward-compatible alias
export const MemoryCache = MultiTierCache;
export const apiCache = new MultiTierCache();
