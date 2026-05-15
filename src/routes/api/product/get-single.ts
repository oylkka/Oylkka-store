import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/product/get-single')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { id } = await request.json();

          if (!id) {
            return Response.json(
              { error: 'Product ID is required' },
              { status: 400 },
            );
          }

          const product = await prisma.product.findUnique({
            where: { id },
            include: {
              category: { select: { id: true, name: true } },
              images: { orderBy: { order: 'asc' } },
              _count: { select: { reviews: true, orderItems: true } },
            },
          });

          if (!product) {
            return Response.json(
              { error: 'Product not found' },
              { status: 404 },
            );
          }

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop || product.shopId !== shop.id) {
            if (
              session.user.role !== 'ADMIN' &&
              session.user.role !== 'MANAGER'
            ) {
              return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
          }

          return Response.json(product, { status: 200 });
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
