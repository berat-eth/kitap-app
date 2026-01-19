import { config } from '../config/env';
import logger from '../utils/logger';

// Simple in-memory cache (can be replaced with Redis)
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export class CacheService {
  static set(key: string, data: unknown, ttlSeconds: number = 300): void {
    if (!config.redis.enabled) {
      // Use in-memory cache
      const expiresAt = Date.now() + ttlSeconds * 1000;
      cache.set(key, { data, expiresAt });

      // Clean up expired entries periodically
      if (cache.size > 1000) {
        this.cleanExpired();
      }
    } else {
      // TODO: Implement Redis cache
      logger.warn('Redis cache not implemented yet');
    }
  }

  static get<T>(key: string): T | null {
    if (!config.redis.enabled) {
      const entry = cache.get(key);
      if (!entry) {
        return null;
      }

      if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
      }

      return entry.data as T;
    } else {
      // TODO: Implement Redis cache
      logger.warn('Redis cache not implemented yet');
      return null;
    }
  }

  static delete(key: string): void {
    if (!config.redis.enabled) {
      cache.delete(key);
    } else {
      // TODO: Implement Redis cache
      logger.warn('Redis cache not implemented yet');
    }
  }

  static clear(): void {
    if (!config.redis.enabled) {
      cache.clear();
    } else {
      // TODO: Implement Redis cache
      logger.warn('Redis cache not implemented yet');
    }
  }

  static cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(key);
      }
    }
  }

  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

