import { getRequestHeaders } from '@tanstack/react-start/server';

function isTrusted(url: string | null, trustedOrigin: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.origin === trustedOrigin;
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: this is fine
    console.error('CSRF validation error:', error);
    return url === trustedOrigin || url.startsWith(`${trustedOrigin}/`);
  }
}

export function validateCsrf(): Response | null {
  let headers: Headers | null;
  try {
    headers = getRequestHeaders();
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: this is fine
    console.error('CSRF header parse error:', error);
    headers = null;
  }

  if (!headers) return null;
  const origin = headers.get('origin');
  const referer = headers.get('referer');

  if (!origin && !referer) {
    return null;
  }

  const trustedOrigin = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

  if (origin && !isTrusted(origin, trustedOrigin)) {
    return Response.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  if (referer && !isTrusted(referer, trustedOrigin)) {
    return Response.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  return null;
}
