import { createFileRoute } from '@tanstack/react-router';
import { createUserTokenRequest } from '@/lib/ably';
import { requireAuth } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';

export const Route = createFileRoute('/api/chat/ably/token')({
  server: {
    handlers: {
      GET: async () => {
        const authResult = await requireAuth();
        if (authResult.response) return authResult.response;

        try {
          const tokenRequest = await createUserTokenRequest(
            authResult.session.user.id,
          );

          if (!tokenRequest) {
            return Response.json(
              { error: 'Real-time messaging is not configured' },
              { status: 503 },
            );
          }

          return Response.json(tokenRequest, {
            headers: { 'Cache-Control': 'no-store' },
          });
        } catch (error) {
          logError('ably-token', error);
          return Response.json(
            { error: 'Unable to create real-time token' },
            { status: 500 },
          );
        }
      },
    },
  },
});
