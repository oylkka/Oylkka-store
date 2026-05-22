import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/conversations/list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const isAdmin =
            session.user.role === 'ADMIN' ||
            session.user.role === 'MANAGER' ||
            session.user.role === 'CUSTOMER_SERVICE';
          if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

          const conversations = await prisma.conversation.findMany({
            include: {
              customer: {
                select: { id: true, name: true, email: true, imageUrl: true },
              },
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

          return Response.json({ conversations });
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
