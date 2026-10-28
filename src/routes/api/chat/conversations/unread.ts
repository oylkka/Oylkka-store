import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';
import { countUnreadMessages } from '@/lib/messaging-view';

export const Route = createFileRoute('/api/chat/conversations/unread')({
  server: {
    handlers: {
      GET: async () => {
        const authResult = await requireAuth();
        if (authResult.response) return authResult.response;

        try {
          const unreadCount = await countUnreadMessages(
            authResult.session.user.id,
          );
          return Response.json({ unreadCount });
        } catch (error) {
          logError('chat-conversations-unread', error);
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
