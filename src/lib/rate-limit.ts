/**
 * Rate limiting with a pluggable store.
 *
 * The default store is in-memory (per-process) and is perfect for a single
 * Node instance. For multi-instance/serverless deployments swap in a Redis
 * store (or any store implementing {@link RateLimitStore}) so the counters are
 * shared across processes.
 */

export interface RateLimitStore {
  /** Read the current counter for `key` without modifying it. */
  get(key: string): { count: number; firstAt: number } | null;
  /** Increment the counter for `key`; returns the new state. */
  hit(key: string, now?: number): { count: number; firstAt: number };
  /** Reset the counter for `key`. */
  reset(key: string): void;
}

/** In-memory store (per-process). */
class MemoryRateLimitStore implements RateLimitStore {
  private map = new Map<string, { count: number; firstAt: number }>();

  get(key: string): { count: number; firstAt: number } | null {
    return this.map.get(key) ?? null;
  }

  hit(key: string, now = Date.now()): { count: number; firstAt: number } {
    const rec = this.map.get(key);
    if (!rec) {
      const fresh = { count: 1, firstAt: now };
      this.map.set(key, fresh);
      return fresh;
    }
    rec.count += 1;
    return rec;
  }

  reset(key: string): void {
    this.map.delete(key);
  }
}

/**
 * The active store. Default is in-memory. Provide a Redis-backed store via
 * `setRateLimitStore` (e.g. in `instrumentation.ts` on startup) for
 * multi-instance deployments.
 */
export function getRateLimitStore(): RateLimitStore {
  const g = globalThis as unknown as { __RATE_LIMIT_STORE__?: RateLimitStore };
  return g.__RATE_LIMIT_STORE__ ?? (memoryStore ??= new MemoryRateLimitStore());
}

export function setRateLimitStore(store: RateLimitStore): void {
  (globalThis as unknown as { __RATE_LIMIT_STORE__: RateLimitStore }).__RATE_LIMIT_STORE__ = store;
}

let memoryStore: MemoryRateLimitStore | null = null;

/**
 * A fixed-window limiter anchored at the first hit.
 *
 * Semantics (matches the original admin-login behavior):
 * - `check(key)` reads the counter WITHOUT incrementing; returns true when locked.
 * - `recordFailure(key)` increments (call it only after a failed attempt).
 * - `reset(key)` clears the counter (call it after a successful attempt).
 * - Expired windows are cleaned up lazily on the next check.
 */
export function createRateLimiter(opts: { max: number; windowMs: number; store?: RateLimitStore }) {
  const store = opts.store ?? getRateLimitStore();

  function isExpired(rec: { firstAt: number }, now: number): boolean {
    return now - rec.firstAt > opts.windowMs;
  }

  function check(key: string, now = Date.now()): boolean {
    const rec = store.get(key);
    if (!rec) return false;
    if (isExpired(rec, now)) {
      store.reset(key);
      return false;
    }
    return rec.count >= opts.max;
  }

  function recordFailure(key: string, now = Date.now()): void {
    const rec = store.get(key);
    if (!rec || isExpired(rec, now)) {
      store.reset(key);
      store.hit(key, now);
      return;
    }
    store.hit(key, now);
  }

  function reset(key: string): void {
    store.reset(key);
  }

  return { check, recordFailure, reset };
}
