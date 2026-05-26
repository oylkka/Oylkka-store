import { getRequestHeaders } from '@tanstack/react-start/server';

function getSafeRequestHeaders(): Headers | null {
  try {
    return getRequestHeaders();
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: this is fine
    console.error('Rate limit guard error:', error);
    return null;
  }
}

export async function checkRateLimit(
  limiter: {
    limit: (
      identifier: string,
    ) => Promise<{ success: boolean; remaining: number }>;
  },
  identifier?: string,
): Promise<Response | null> {
  const headers = getSafeRequestHeaders();
  const ip =
    identifier ??
    headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
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
