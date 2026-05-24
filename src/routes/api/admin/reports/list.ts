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
          const where: Record<string, unknown> = {};
          if (status) where.status = status;

          const reports = await prisma.productReport.findMany({
            where,
            include: {
              product: { select: { id: true, productName: true, slug: true } },
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
          });
          return Response.json({ reports });
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
