import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/cart/remove')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const body = await request.json();
          const { itemId } = body;

          if (!itemId) {
            return Response.json(
              { error: 'Item ID is required' },
              { status: 400 },
            );
          }

          const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: { select: { userId: true } } },
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

          await prisma.cartItem.delete({ where: { id: itemId } });

          return Response.json(
            { message: 'Item removed from cart' },
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
