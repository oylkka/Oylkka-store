import { getRequestHeaders } from '@tanstack/react-start/server';

export async function checkRateLimit(
  limiter: {
    limit: (
      identifier: string,
    ) => Promise<{ success: boolean; remaining: number }>;
  },
  identifier?: string,
): Promise<Response | null> {
  const headers = getRequestHeaders();
  const ip =
    identifier ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const { success, remaining } = await limiter.limit(ip);

  if (!success) {
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': String(remaining),
        },
      },
    );
  }

  return null;
}
