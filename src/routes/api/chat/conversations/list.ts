import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';
import {
  conversationContextSelect,
  countUnreadMessages,
  messageSummarySelect,
  toConversationListItem,
} from '@/lib/messaging-view';

export const Route = createFileRoute('/api/chat/conversations/list')({
  server: {
    handlers: {
      GET: async () => {
        const authResult = await requireAuth();
        if (authResult.response) return authResult.response;
        const userId = authResult.session.user.id;

        try {
          const [conversations, unreadCount] = await Promise.all([
            prisma.conversation.findMany({
              where: {
                OR: [{ customerId: userId }, { shop: { ownerId: userId } }],
              },
              select: {
                ...conversationContextSelect,
                messages: {
                  orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                  take: 1,
                  select: messageSummarySelect,
                },
                _count: {
                  select: { messages: true },
                },
              },
              orderBy: [
                { lastMessageAt: { sort: 'desc', nulls: 'last' } },
                { createdAt: 'desc' },
              ],
            }),
            countUnreadMessages(userId),
          ]);

          const items = conversations.map((row) => {
            const viewerRole =
              row.customerId === userId ? 'customer' : 'vendor';
            return toConversationListItem(
              {
                ...row,
                lastMessage: row.messages[0] ?? null,
                messageCount: row._count.messages,
              },
              viewerRole,
            );
          });

          return Response.json({
            conversations: items,
            unreadCount,
          });
        } catch (error) {
          logError('chat-conversations-list', error);
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
