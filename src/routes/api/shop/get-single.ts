import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/shop/get-single')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (
            !session?.user ||
            (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')
          ) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { id } = (await request.json()) as { id: string };

          if (!id) {
            return Response.json(
              { error: 'Shop ID is required' },
              { status: 400 },
            );
          }

          const shop = await prisma.shop.findUnique({
            where: { id },
            include: {
              owner: { select: { name: true, email: true } },
            },
          });

          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          return Response.json(shop, { status: 200 });
        } catch {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
