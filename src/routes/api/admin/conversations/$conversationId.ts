import { createFileRoute } from '@tanstack/react-router';
import { requireAuth, requireStaff } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute(
  '/api/admin/conversations/$conversationId',
)({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireStaff(authResult.session);
          if (roleResponse) return roleResponse;

          const isAdmin =
            session.user.role === 'ADMIN' ||
            session.user.role === 'MANAGER' ||
            session.user.role === 'CUSTOMER_SERVICE';
          if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

          const conversation = await prisma.conversation.findUnique({
            where: { id: params.conversationId },
            include: {
              customer: {
                select: { id: true, name: true, email: true, imageUrl: true },
              },
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
    },
  },
});
