import { beforeEach, describe, expect, it } from 'bun:test';
import { SafeRatelimit } from '@/lib/rate-limit';
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
    // The module builds its limiters once at import time from whatever
    // credentials were present then, so deleting env vars and re-importing
    // cannot reproduce the unconfigured path when another test file has
    // already cached the module. Constructing the wrapper with a null Redis
    // client mirrors exactly what `build` does without credentials, keeping
    // the test deterministic and guaranteeing it never hits the network.
    const limiter = new SafeRatelimit('ratelimit:auth', 5, null);

    // authLimiter allows 5 per window.
    const results = [];
    for (let i = 0; i < 6; i++) {
      results.push(await limiter.limit('203.0.113.9'));
    }
    expect(results.slice(0, 5).every((r) => r.success)).toBe(true);
    expect(results[5].success).toBe(false);
  });
});
