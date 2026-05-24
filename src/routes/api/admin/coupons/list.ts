import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/coupons/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const url = new URL(request.url);
          const scope = url.searchParams.get('scope') || undefined;
          const isActive =
            url.searchParams.get('isActive') === 'true'
              ? true
              : url.searchParams.get('isActive') === 'false'
                ? false
                : undefined;
          const search = url.searchParams.get('search') || undefined;
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            100,
            Math.max(1, Number(url.searchParams.get('limit')) || 20),
          );
          const skip = (page - 1) * limit;

          const where: Record<string, unknown> = {};
          if (scope) where.scope = scope;
          if (isActive !== undefined) where.isActive = isActive;
          if (search) {
            where.code = { contains: search, mode: 'insensitive' };
          }

          const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
              where,
              include: { _count: { select: { usages: true } } },
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            }),
            prisma.coupon.count({ where }),
          ]);

          return Response.json({
            coupons,
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
