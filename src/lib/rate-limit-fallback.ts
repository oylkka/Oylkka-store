import { createHash } from 'node:crypto';

/**
 * In-process sliding-window rate limiter.
 *
 * Used when Upstash Redis is unreachable or unconfigured, so that a Redis
 * outage degrades to weaker (per-process) rate limiting rather than taking
 * down every endpoint that calls checkRateLimit.
 *
 * Semantics mirror @upstash/ratelimit's slidingWindow. Buckets are namespaced
 * by scope (the limiter prefix) because Upstash keys counters as
 * `<prefix>:<identifier>`; sharing one bucket across limiters would let traffic
 * to one route consume another's budget.
 */

/**
 * Hard cap on tracked buckets. Identifiers come from the attacker-controlled
 * `x-forwarded-for` header, so an unbounded map is a memory-exhaustion vector.
 */
const MAX_BUCKETS = 10_000;
const SWEEP_INTERVAL_MS = 60_000;
const SWEEPER_KEY = '__oylkkaRateLimitFallbackSweeper';

interface Bucket {
  hits: number[];
  windowMs: number;
}

const buckets = new Map<string, Bucket>();

function hashBucketKey(scope: string, identifier: string): string {
  return createHash('sha256')
    .update(`${scope}:${identifier}`)
    .digest('hex')
    .slice(0, 16);
}

/** Drop timestamps at or before the cutoff. Hits are appended in order. */
function pruneHits(hits: number[], cutoff: number): number[] {
  let start = 0;
  while (start < hits.length && hits[start] <= cutoff) {
    start++;
  }
  return start === 0 ? hits : hits.slice(start);
}

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    const kept = pruneHits(bucket.hits, now - bucket.windowMs);
    if (kept.length === 0) {
      buckets.delete(key);
    } else {
      bucket.hits = kept;
    }
  }
}

/** Free space for one new bucket, emptying stale buckets before evicting. */
function makeRoom(now: number): void {
  if (buckets.size < MAX_BUCKETS) {
    return;
  }
  sweep(now);
  // Map preserves insertion order, so the first key is the oldest bucket.
  while (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next();
    if (oldest.done) {
      return;
    }
    buckets.delete(oldest.value);
  }
}

function installSweeper(): void {
  const host = globalThis as unknown as {
    [SWEEPER_KEY]?: ReturnType<typeof setInterval>;
  };
  // Vite HMR re-imports this module; drop the previous timer so dev sessions
  // do not accumulate one sweeper per reload.
  if (host[SWEEPER_KEY]) {
    clearInterval(host[SWEEPER_KEY]);
  }
  const timer = setInterval(() => sweep(Date.now()), SWEEP_INTERVAL_MS);
  // Never hold the process open just for cleanup.
  timer.unref?.();
  host[SWEEPER_KEY] = timer;
}

installSweeper();

export interface FallbackResult {
  success: boolean;
  remaining: number;
}

export function hitFallback(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): FallbackResult {
  makeRoom(now);

  const key = hashBucketKey(scope, identifier);
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [], windowMs };
    buckets.set(key, bucket);
  }

  bucket.hits = pruneHits(bucket.hits, now - bucket.windowMs);
  bucket.hits.push(now);

  const count = bucket.hits.length;
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

/** Current bucket count. Exposed for tests and diagnostics. */
export function fallbackBucketCount(): number {
  return buckets.size;
}

/** Clear all tracked buckets. Exposed for tests. */
export function resetFallback(): void {
  buckets.clear();
}
