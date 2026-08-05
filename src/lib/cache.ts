/**
 * Simple In-Memory TTL Cache for backend API routes.
 * Useful for caching small, infrequently changing collections like locations, domains, and job_types
 * to prevent full Firestore collection scans on every single GET request.
 */
class MemoryCache {
    private cache: Map<string, { data: any; expiry: number }> = new Map();

    /**
     * Get data from cache
     * @param key cache key
     * @returns cached data or null if expired/not found
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
     * Set data in cache
     * @param key cache key
     * @param data data to cache
     * @param ttlMs Time to live in milliseconds (default: 5 minutes = 300000ms)
     */
    set(key: string, data: any, ttlMs: number = 300000): void {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttlMs,
        });
    }

    /**
     * Delete data from cache
     * @param key cache key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cached data
     */
    clear(): void {
        this.cache.clear();
    }
}

// Global singleton instance so it persists across Next.js API requests (in dev & serverless environments where container is reused)
export const apiCache = new MemoryCache();
