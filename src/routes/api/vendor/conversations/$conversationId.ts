import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute(
  '/api/vendor/conversations/$conversationId',
)({
  server: {
    handlers: {
      GET: async ({ params }) => {
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

          const conversation = await prisma.conversation.findUnique({
            where: { id: params.conversationId },
            include: {
              customer: {
                select: { id: true, name: true, email: true, imageUrl: true },
              },
              order: {
                select: { id: true, orderNumber: true },
              },
              product: {
                select: {
                  id: true,
                  slug: true,
                  productName: true,
                  images: { take: 1, select: { imageUrl: true } },
                },
              },
            },
          });

          if (!conversation || conversation.shopId !== shop.id) {
            return Response.json(
              { error: 'Conversation not found' },
              { status: 404 },
            );
          }

          return Response.json({ conversation });
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
      PATCH: async ({ params, request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
            select: { id: true },
          });

          if (!shop) {
            return Response.json({ error: 'No shop found' }, { status: 404 });
          }

          const conversation = await prisma.conversation.findUnique({
            where: { id: params.conversationId },
          });

          if (!conversation || conversation.shopId !== shop.id) {
            return Response.json(
              { error: 'Conversation not found' },
              { status: 404 },
            );
          }

          const body = await request.json();
          const { action } = body;

          if (action === 'read') {
            await prisma.message.updateMany({
              where: {
                conversationId: params.conversationId,
                senderId: { not: session.user.id },
                isRead: false,
              },
              data: { isRead: true },
            });
            return Response.json({ success: true });
          }

          if (action === 'close') {
            await prisma.conversation.update({
              where: { id: params.conversationId },
              data: { status: 'CLOSED' },
            });
            return Response.json({ success: true });
          }

          return Response.json({ error: 'Invalid action' }, { status: 400 });
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
