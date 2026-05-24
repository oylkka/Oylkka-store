import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/conversations/close')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;
          const session = authResult.session;

          const isAdmin =
            session.user.role === 'ADMIN' || session.user.role === 'MANAGER';
          if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body = await request.json();
          const { conversationId, status } = body;

          if (
            !conversationId ||
            !status ||
            !['OPEN', 'CLOSED'].includes(status)
          ) {
            return Response.json(
              { error: 'conversationId and status (OPEN|CLOSED) are required' },
              { status: 400 },
            );
          }

          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
          });

          if (!conversation) {
            return Response.json(
              { error: 'Conversation not found' },
              { status: 404 },
            );
          }

          await prisma.conversation.update({
            where: { id: conversationId },
            data: { status },
          });

          return Response.json({ success: true });
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
