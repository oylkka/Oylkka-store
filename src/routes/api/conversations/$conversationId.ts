import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/conversations/$conversationId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const conversation = await prisma.conversation.findUnique({
            where: { id: params.conversationId },
            include: {
              shop: {
                select: { id: true, name: true, slug: true, logoUrl: true },
              },
            },
          });

          if (!conversation) {
            return Response.json(
              { error: 'Conversation not found' },
              { status: 404 },
            );
          }

          if (conversation.customerId !== session.user.id) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
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

          const body = await request.json();
          const { action } = body;

          const conversation = await prisma.conversation.findUnique({
            where: { id: params.conversationId },
          });

          if (!conversation) {
            return Response.json(
              { error: 'Conversation not found' },
              { status: 404 },
            );
          }

          if (conversation.customerId !== session.user.id) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

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
