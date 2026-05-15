import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/product/vendor-list')({
  server: {
    handlers: {
      GET: async () => {
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
            return Response.json([], { status: 200 });
          }

          const products = await prisma.product.findMany({
            where: { shopId: shop.id },
            include: {
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
