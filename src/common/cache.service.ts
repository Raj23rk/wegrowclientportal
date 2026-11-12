import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Retrieve cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Store a value in memory cache with TTL in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number = 30): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  /**
   * Delete a specific cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all keys matching substring or regex pattern
   */
  deletePattern(pattern: RegExp | string): void {
    for (const key of this.cache.keys()) {
      const match = typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key);
      if (match) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * High performance wrapper: returns cached value or executes fetcher, caches, and returns
   */
  async wrap<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const result = await fetcher();
    this.set(key, result, ttlSeconds);
    return result;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}
