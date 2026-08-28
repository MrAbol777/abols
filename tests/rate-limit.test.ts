import { describe, expect, it } from "vitest";
import { createRateLimiter, type RateLimitStore } from "@/lib/rate-limit";

class MemoryStore implements RateLimitStore {
  private map = new Map<string, { count: number; firstAt: number }>();
  get(k: string) { return this.map.get(k) ?? null; }
  hit(k: string, now = Date.now()) {
    const rec = this.map.get(k);
    if (!rec) { const f = { count: 1, firstAt: now }; this.map.set(k, f); return f; }
    rec.count += 1; return rec;
  }
  reset(k: string) { this.map.delete(k); }
}

describe("createRateLimiter", () => {
  it("allows up to max failures then locks", () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000, store: new MemoryStore() });
    const key = "ip:phone";
    expect(limiter.check(key)).toBe(false);
    limiter.recordFailure(key); // 1
    limiter.recordFailure(key); // 2
    limiter.recordFailure(key); // 3
    expect(limiter.check(key)).toBe(true); // 3 >= max=3
  });

  it("check() does not increment", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000, store: new MemoryStore() });
    const key = "k";
    limiter.check(key);
    limiter.check(key);
    expect(limiter.check(key)).toBe(false); // never incremented
  });

  it("resets after success", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000, store: new MemoryStore() });
    const key = "k";
    limiter.recordFailure(key);
    expect(limiter.check(key)).toBe(true);
    limiter.reset(key);
    expect(limiter.check(key)).toBe(false);
  });

  it("expires after the window", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000, store: new MemoryStore() });
    const key = "k";
    limiter.recordFailure(key);
    // 61 seconds later the window has passed.
    expect(limiter.check(key, Date.now() + 61_000)).toBe(false);
  });
});