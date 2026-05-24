import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/reviews/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (
            !session?.user ||
            (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')
          ) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const url = new URL(request.url);
          const reported =
            url.searchParams.get('reported') === 'true'
              ? true
              : url.searchParams.get('reported') === 'false'
                ? false
                : undefined;
          const verified =
            url.searchParams.get('verified') === 'true'
              ? true
              : url.searchParams.get('verified') === 'false'
                ? false
                : undefined;
          const minRating = url.searchParams.get('minRating')
            ? Number(url.searchParams.get('minRating'))
            : undefined;
          const search = url.searchParams.get('search') || undefined;
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            100,
            Math.max(1, Number(url.searchParams.get('limit')) || 20),
          );
          const skip = (page - 1) * limit;

          const where: Record<string, unknown> = {};
          if (reported !== undefined) where.reported = reported;
          if (verified !== undefined) where.verified = verified;
          if (minRating !== undefined) where.rating = { gte: minRating };
          if (search) {
            where.product = {
              productName: { contains: search, mode: 'insensitive' },
            };
          }

          const [reviews, total] = await Promise.all([
            prisma.review.findMany({
              where,
              include: {
                user: { select: { id: true, name: true, email: true, imageUrl: true } },
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
            prisma.review.count({ where }),
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
