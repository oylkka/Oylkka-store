import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  // biome-ignore lint/suspicious/noConsole: CLI script output is the point
  console.error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN.');
  process.exit(1);
}

const KEY = 'upstash:keepalive';

/**
 * Upstash archives free-tier databases after a period of inactivity. A bare
 * PING may not count as activity, so write a real key instead.
 *
 * TTL is 14 days: two cron intervals, so the key cannot lapse between runs and
 * leave stale state behind. The TTL is hygiene only, it does not extend the
 * inactivity window, since only the SET counts as activity.
 */
const TTL_SECONDS = 14 * 24 * 60 * 60;

try {
  const redis = new Redis({ url, token });
  const value = new Date().toISOString();
  const result = await redis.set(KEY, value, { ex: TTL_SECONDS });
  // biome-ignore lint/suspicious/noConsole: CLI script output is the point
  console.log(`Keepalive OK: ${KEY} = ${result}`);
} catch (error) {
  // biome-ignore lint/suspicious/noConsole: CLI script output is the point
  console.error('Keepalive FAILED:', error);
  process.exit(1);
}
