import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/reviews/my/list')({
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
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            20,
            Math.max(1, Number(url.searchParams.get('limit')) || 10),
          );
          const skip = (page - 1) * limit;

          const [reviews, total] = await Promise.all([
            prisma.review.findMany({
              where: { userId: session.user.id },
              include: {
                product: {
                  select: {
                    id: true,
                    productName: true,
                    slug: true,
                    images: { take: 1, orderBy: { order: 'asc' as const } },
                  },
                },
                images: { orderBy: { order: 'asc' as const } },
              },
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            }),
            prisma.review.count({ where: { userId: session.user.id } }),
          ]);

          return Response.json({
            reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit),
          });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
          );
        }
      },
    },
  },
});
