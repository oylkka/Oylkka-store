import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vendor/payouts/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop) {
            return Response.json({ error: 'No shop found' }, { status: 404 });
          }

          const url = new URL(request.url);
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            100,
            Math.max(1, Number(url.searchParams.get('limit')) || 50),
          );
          const where = { shopId: shop.id };

          const [payouts, total] = await Promise.all([
            prisma.payout.findMany({
              where,
              include: {
                _count: { select: { items: true } },
              },
              orderBy: { createdAt: 'desc' },
              skip: (page - 1) * limit,
              take: limit,
            }),
            prisma.payout.count({ where }),
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
