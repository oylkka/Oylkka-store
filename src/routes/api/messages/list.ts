import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/messages/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const url = new URL(request.url);
          const conversationId = url.searchParams.get('conversationId');

          if (!conversationId) {
            return Response.json(
              { error: 'conversationId is required' },
              { status: 400 },
            );
          }

          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: {
              customerId: true,
              shopId: true,
              shop: { select: { ownerId: true } },
            },
          });

          if (!conversation) {
            return Response.json(
              { error: 'Conversation not found' },
              { status: 404 },
            );
          }

          const isCustomer = conversation.customerId === session.user.id;
          const isVendor = conversation.shop.ownerId === session.user.id;
          const isAdmin =
            session.user.role === 'ADMIN' ||
            session.user.role === 'MANAGER' ||
            session.user.role === 'CUSTOMER_SERVICE';

          if (!isCustomer && !isVendor && !isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

          const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
                select: { id: true, name: true, imageUrl: true },
              },
            },
          });

          return Response.json({ messages });
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
