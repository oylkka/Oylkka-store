import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/wishlist/list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const items = await prisma.wishlistItem.findMany({
            where: { userId: session.user.id },
            include: {
              product: {
                select: {
                  id: true,
                  productName: true,
                  slug: true,
                  price: true,
                  discountPrice: true,
                  images: {
                    take: 1,
                    orderBy: { order: 'asc' },
                    select: { imageUrl: true },
                  },
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  discountPrice: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          return Response.json({ items }, { status: 200 });
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
