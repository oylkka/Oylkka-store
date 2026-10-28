import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth-middleware';
import { getConversationAccess } from '@/lib/conversation-access';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';
import { messageViewSelect, toMessageView } from '@/lib/messaging-view';

export const Route = createFileRoute('/api/chat/messages/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authResult = await requireAuth();
        if (authResult.response) return authResult.response;

        const conversationId = new URL(request.url).searchParams
          .get('conversationId')
          ?.trim();

        if (!conversationId) {
          return Response.json(
            { error: 'conversationId is required' },
            { status: 400 },
          );
        }

        try {
          const accessResult = await getConversationAccess(
            conversationId,
            authResult.session.user.id,
          );
          if (accessResult.response) return accessResult.response;

          const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            select: messageViewSelect,
          });

          return Response.json({
            messages: messages.map(toMessageView),
          });
        } catch (error) {
          logError('chat-messages-list', error);
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
