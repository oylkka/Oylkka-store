import { createFileRoute } from '@tanstack/react-router';
import { requireAuth, requireStaff } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/conversations/list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireStaff(authResult.session);
          if (roleResponse) return roleResponse;

          const isAdmin =
            authResult.session.user.role === 'ADMIN' ||
            authResult.session.user.role === 'MANAGER' ||
            authResult.session.user.role === 'CUSTOMER_SERVICE';
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
