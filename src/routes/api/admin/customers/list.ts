import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/customers/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const url = new URL(request.url);
          const role = url.searchParams.get('role') || undefined;
          const banned =
            url.searchParams.get('banned') === 'true'
              ? true
              : url.searchParams.get('banned') === 'false'
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
          if (role) where.role = role;
          if (banned !== undefined) where.banned = banned;
          if (search) {
            where.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ];
          }

          const [users, total] = await Promise.all([
            prisma.user.findMany({
              where,
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                banned: true,
                banReason: true,
                imageUrl: true,
                createdAt: true,
                _count: { select: { orders: true, reviews: true } },
              },
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            }),
            prisma.user.count({ where }),
          ]);

          return Response.json({
            customers: users,
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
