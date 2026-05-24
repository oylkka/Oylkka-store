import { createFileRoute } from '@tanstack/react-router';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/payouts/list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdmin(authResult.session);
          if (roleResponse) return roleResponse;

          const payouts = await prisma.payout.findMany({
            include: {
              shop: { select: { id: true, name: true } },
              _count: { select: { items: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          return Response.json({ payouts });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to list payouts',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
