import { createFileRoute } from '@tanstack/react-router';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/payouts/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdmin(authResult.session);
          if (roleResponse) return roleResponse;

          const url = new URL(request.url);
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            100,
            Math.max(1, Number(url.searchParams.get('limit')) || 50),
          );

          const [payouts, total] = await Promise.all([
            prisma.payout.findMany({
              include: {
                shop: { select: { id: true, name: true } },
                _count: { select: { items: true } },
              },
              orderBy: { createdAt: 'desc' },
              skip: (page - 1) * limit,
              take: limit,
            }),
            prisma.payout.count(),
          ]);

          return Response.json({
            payouts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
          });
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
