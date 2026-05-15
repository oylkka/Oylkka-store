import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/shop/reject')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { id, rejectionReason } = (await request.json()) as {
            id: string;
            rejectionReason: string;
          };

          if (!id) {
            return Response.json(
              { error: 'Shop ID is required' },
              { status: 400 },
            );
          }

          if (!rejectionReason?.trim()) {
            return Response.json(
              { error: 'Rejection reason is required' },
              { status: 400 },
            );
          }

          const shop = await prisma.shop.findUnique({
            where: { id },
          });

          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          if (shop.status !== 'PENDING') {
            return Response.json(
              { error: 'Shop is not pending' },
              { status: 400 },
            );
          }

          const updated = await prisma.shop.update({
            where: { id },
            data: {
              status: 'REJECTED',
              rejectionReason: rejectionReason.trim(),
            },
          });

          return Response.json(
            { message: 'Shop rejected', shop: updated },
            { status: 200 },
          );
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
