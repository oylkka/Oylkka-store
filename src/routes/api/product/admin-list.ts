import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

/**
 * Every product on the platform, for the admin console. The vendor list
 * (`/api/product/vendor-list`) is scoped to the caller's own shop, so it can
 * never power an admin view — this is the platform-wide counterpart, and it is
 * staff-only.
 */
export const Route = createFileRoute('/api/product/admin-list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const session = authResult.session;

          const forbidden = requireAdminOrManager(session);
          if (forbidden) return forbidden;

          const products = await prisma.product.findMany({
            include: {
              shop: { select: { id: true, name: true, status: true } },
              category: { select: { id: true, name: true } },
              images: { orderBy: { order: 'asc' } },
              _count: { select: { reviews: true, orderItems: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          return Response.json(products, { status: 200 });
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
