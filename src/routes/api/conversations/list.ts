import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/conversations/list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const conversations = await prisma.conversation.findMany({
            where: { customerId: session.user.id },
            include: {
              shop: {
                select: { id: true, name: true, slug: true, logoUrl: true },
              },
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                  content: true,
                  createdAt: true,
                  senderId: true,
                  isRead: true,
                },
              },
              _count: {
                select: { messages: true },
              },
            },
            orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
          });

          const unreadCount = await prisma.message.count({
            where: {
              conversation: { customerId: session.user.id },
              senderId: { not: session.user.id },
              isRead: false,
            },
          });

          return Response.json({ conversations, unreadCount });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Internal Server Error',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
