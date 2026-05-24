import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/returns/list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const url = new URL(request.url);
          const status = url.searchParams.get('status') || undefined;

          const where: Record<string, unknown> = {};
          if (status) {
            where.status = status;
          }

          const returns = await prisma.returnRequest.findMany({
            where,
            include: {
              customer: {
                select: { id: true, name: true, email: true },
              },
              shop: {
                select: { id: true, name: true },
              },
              order: {
                select: { orderNumber: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          return Response.json({ returns });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to list return requests',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
