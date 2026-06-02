import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/global-attributes/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const url = new URL(request.url);
          const search = url.searchParams.get('search') || undefined;
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            100,
            Math.max(1, Number(url.searchParams.get('limit')) || 50),
          );
          const skip = (page - 1) * limit;

          const where: Record<string, unknown> = {};
          if (search) {
            where.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ];
          }

          const [attributes, total] = await Promise.all([
            prisma.globalAttribute.findMany({
              where,
              include: {
                values: {
                  orderBy: { slug: 'asc' },
                },
                _count: { select: { productLinks: true } },
              },
              orderBy: { displayOrder: 'asc' },
              skip,
              take: limit,
            }),
            prisma.globalAttribute.count({ where }),
          ]);

          return Response.json({
            attributes,
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
                  : 'Internal Server Error',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
