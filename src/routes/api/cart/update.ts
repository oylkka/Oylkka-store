import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/cart/update')({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const body = await request.json();
          const { itemId, quantity } = body;

          if (!itemId || !quantity || quantity < 1) {
            return Response.json(
              { error: 'Item ID and valid quantity are required' },
              { status: 400 },
            );
          }

          const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
              cart: { select: { userId: true } },
              product: { select: { stock: true } },
            },
          });

          if (!item) {
            return Response.json(
              { error: 'Cart item not found' },
              { status: 404 },
            );
          }

          if (item.cart.userId !== session.user.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
          }

          if (quantity > item.product.stock) {
            return Response.json(
              { error: `Only ${item.product.stock} items available` },
              { status: 400 },
            );
          }

          await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
          });

          return Response.json(
            { message: 'Cart updated successfully' },
            { status: 200 },
          );
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
