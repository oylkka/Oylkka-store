import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vendor/conversations/list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
            select: { id: true },
          });

          if (!shop) {
            return Response.json({ error: 'No shop found' }, { status: 404 });
          }

          const conversations = await prisma.conversation.findMany({
            where: { shopId: shop.id },
            include: {
              customer: {
                select: { id: true, name: true, email: true, imageUrl: true },
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
              conversation: { shopId: shop.id },
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
