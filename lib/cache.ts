/**
 * Cache abstraction layer.
 * - In the browser: uses a Map with TTL (in-process, per-tab)
 * - Server-side: ready to swap for Redis / Upstash via the same interface
 * - No Redis installed — just the abstraction contract
 */

export interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export interface CacheStore {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttlMs?: number): void
  delete(key: string): void
  clear(): void
  has(key: string): boolean
}

// ── In-memory implementation (browser / test) ─────────────────────────────────
class MemoryCache implements CacheStore {
  private store = new Map<string, CacheEntry<unknown>>()
  private readonly DEFAULT_TTL = 60_000 // 1 minute

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs = this.DEFAULT_TTL): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Evict expired entries (call periodically)
  evict(): void {
    const now = Date.now()
    for (const [k, v] of this.store) {
      if (now > v.expiresAt) this.store.delete(k)
    }
  }

  get size(): number { return this.store.size }
}

// ── Redis-ready adapter interface (swap in when Redis is available) ───────────
export interface RedisAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string, expiryMs: number): Promise<void>
  del(key: string): Promise<void>
}

/**
 * Creates a Redis-backed CacheStore when a RedisAdapter is provided.
 * Async operations are wrapped in fire-and-forget for non-critical caching.
 */
export function createRedisCache(redis: RedisAdapter): CacheStore {
  const local = new MemoryCache() // L1 in-process
  return {
    get<T>(key: string): T | null {
      const cached = local.get<T>(key)
      if (cached !== null) return cached
      // Async Redis fetch — updates L1 on next access
      redis.get(key).then((raw) => {
        if (raw) {
          try { local.set<T>(key, JSON.parse(raw)) } catch { /* ignore */ }
        }
      }).catch(() => { /* Redis unavailable — degrade to memory */ })
      return null
    },
    set<T>(key: string, value: T, ttlMs = 60_000): void {
      local.set(key, value, ttlMs)
      redis.set(key, JSON.stringify(value), ttlMs).catch(() => { /* degrade */ })
    },
    delete(key: string): void {
      local.delete(key)
      redis.del(key).catch(() => { /* degrade */ })
    },
    clear(): void { local.clear() },
    has(key: string): boolean { return local.has(key) },
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────
export const cache = new MemoryCache()

// Evict expired entries every 5 minutes in the browser
if (typeof window !== 'undefined') {
  setInterval(() => cache.evict(), 5 * 60_000)
}

// ── TTL constants ─────────────────────────────────────────────────────────────
export const TTL = {
  VERY_SHORT:  15_000,   // 15s  — live prices, inventory
  SHORT:       60_000,   // 1m   — user-specific data
  MEDIUM:      5 * 60_000,  // 5m  — campaigns, jobs lists
  LONG:        15 * 60_000, // 15m — static content
  VERY_LONG:   60 * 60_000, // 1h  — eval questions, configs
} as const
