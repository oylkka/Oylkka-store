import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/reports/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;
          const url = new URL(request.url);
          const status = url.searchParams.get('status') || undefined;
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            100,
            Math.max(1, Number(url.searchParams.get('limit')) || 50),
          );
          const where: Record<string, unknown> = {};
          if (status) where.status = status;

          const [reports, total] = await Promise.all([
            prisma.productReport.findMany({
              where,
              include: {
                product: {
                  select: { id: true, productName: true, slug: true },
                },
                user: { select: { id: true, name: true, email: true } },
              },
              orderBy: { createdAt: 'desc' },
              skip: (page - 1) * limit,
              take: limit,
            }),
            prisma.productReport.count({ where }),
          ]);
          return Response.json({
            reports,
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
