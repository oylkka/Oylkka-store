import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/lib/auth';
import { authLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const rateLimitResponse = await checkRateLimit(authLimiter);
        if (rateLimitResponse) return rateLimitResponse;
        return await auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        const rateLimitResponse = await checkRateLimit(authLimiter);
        if (rateLimitResponse) return rateLimitResponse;
        return await auth.handler(request);
      },
    },
  },
});
