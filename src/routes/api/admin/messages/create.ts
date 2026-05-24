import { createFileRoute } from '@tanstack/react-router';
import { requireAuth, requireStaff } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { messageLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

export const Route = createFileRoute('/api/admin/messages/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireStaff(authResult.session);
          if (roleResponse) return roleResponse;
          const session = authResult.session;

          const isAdmin =
            session.user.role === 'ADMIN' ||
            session.user.role === 'MANAGER' ||
            session.user.role === 'CUSTOMER_SERVICE';
          if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const rateLimitResponse = await checkRateLimit(messageLimiter);
          if (rateLimitResponse) return rateLimitResponse;

          const body = await request.json();
          const { conversationId, content } = body;

          if (!conversationId || !content?.trim()) {
            return Response.json(
              { error: 'conversationId and content are required' },
              { status: 400 },
            );
          }

          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, status: true },
          });

          if (!conversation) {
            return Response.json(
              { error: 'Conversation not found' },
              { status: 404 },
            );
          }

          const message = await prisma.message.create({
            data: {
              conversationId,
              senderId: session.user.id,
              content: content.trim(),
            },
          });

          await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
          });

          return Response.json({ message }, { status: 201 });
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
