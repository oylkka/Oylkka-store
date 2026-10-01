import { beforeEach, describe, expect, it } from 'bun:test';
import {
  fallbackBucketCount,
  hitFallback,
  resetFallback,
} from '@/lib/rate-limit-fallback';

const WINDOW_MS = 60_000;
const T0 = 1_700_000_000_000;

describe('hitFallback', () => {
  beforeEach(() => {
    resetFallback();
  });

  it('allows requests up to the limit, then rejects', () => {
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(hitFallback('auth', 'ip', 3, WINDOW_MS, T0));
    }
    expect(results.map((r) => r.success)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
    expect(results.map((r) => r.remaining)).toEqual([2, 1, 0, 0, 0]);
  });

  it('prunes hits that age out of the window', () => {
    expect(hitFallback('auth', 'ip', 1, WINDOW_MS, T0).success).toBe(true);
    // Still inside the window, so the budget is spent.
    expect(hitFallback('auth', 'ip', 1, WINDOW_MS, T0 + 1_000).success).toBe(
      false,
    );
    // Both earlier hits have now aged out.
    expect(
      hitFallback('auth', 'ip', 1, WINDOW_MS, T0 + 1_000 + WINDOW_MS + 1)
        .success,
    ).toBe(true);
  });

  it('slides the window rather than resetting it on a boundary', () => {
    // A hit only frees budget once it is fully outside the window, which is
    // what distinguishes a sliding window from a fixed one.
    hitFallback('auth', 'ip', 1, WINDOW_MS, T0);
    // 59s later the original hit is still in-window, so still blocked.
    expect(hitFallback('auth', 'ip', 1, WINDOW_MS, T0 + 59_000).success).toBe(
      false,
    );
  });

  it('keeps separate budgets per scope for the same identifier', () => {
    for (let i = 0; i < 5; i++) {
      hitFallback('ratelimit:auth', 'ip', 5, WINDOW_MS, T0 + i);
    }
    expect(
      hitFallback('ratelimit:auth', 'ip', 5, WINDOW_MS, T0 + 5).success,
    ).toBe(false);
    // A different limiter must not inherit auth's spent budget.
    expect(
      hitFallback('ratelimit:general', 'ip', 5, WINDOW_MS, T0 + 5).success,
    ).toBe(true);
  });

  it('tracks identifiers independently', () => {
    for (let i = 0; i < 3; i++) {
      hitFallback('auth', 'ip-a', 3, WINDOW_MS, T0);
    }
    expect(hitFallback('auth', 'ip-a', 3, WINDOW_MS, T0).success).toBe(false);
    expect(hitFallback('auth', 'ip-b', 3, WINDOW_MS, T0).success).toBe(true);
  });

  it('bounds tracked buckets against spoofed identifiers', () => {
    // Identifiers come from the attacker-controlled x-forwarded-for header.
    for (let i = 0; i < 12_000; i++) {
      hitFallback('auth', `spoofed-${i}`, 5, WINDOW_MS, T0);
    }
    expect(fallbackBucketCount()).toBeLessThanOrEqual(10_000);
  });
});

describe('SafeRatelimit without Upstash credentials', () => {
  beforeEach(() => {
    resetFallback();
  });

  it('limits in-process rather than throwing', async () => {
    const savedUrl = process.env.UPSTASH_REDIS_REST_URL;
    const savedToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    try {
      const mod = await import('@/lib/rate-limit');
      // Guards against a cached module reaching the real network.
      expect(mod.isRedisConfigured).toBe(false);

      // authLimiter allows 5 per window.
      const results = [];
      for (let i = 0; i < 6; i++) {
        results.push(await mod.authLimiter.limit('203.0.113.9'));
      }
      expect(results.slice(0, 5).every((r) => r.success)).toBe(true);
      expect(results[5].success).toBe(false);
    } finally {
      if (savedUrl === undefined) {
        delete process.env.UPSTASH_REDIS_REST_URL;
      } else {
        process.env.UPSTASH_REDIS_REST_URL = savedUrl;
      }
      if (savedToken === undefined) {
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
      } else {
        process.env.UPSTASH_REDIS_REST_TOKEN = savedToken;
      }
    }
  });
});
