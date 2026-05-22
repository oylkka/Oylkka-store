import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/payouts/pending')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const shops = await prisma.shop.findMany({
            select: {
              id: true,
              name: true,
              commissionRate: true,
            },
          });

          const result = [];
          for (const shop of shops) {
            const items = await prisma.orderItem.findMany({
              where: {
                shopId: shop.id,
                fulfillmentStatus: 'DELIVERED',
                payoutItem: null,
              },
              select: {
                id: true,
                vendorAmount: true,
              },
            });

            if (items.length > 0) {
              const totalAmount = items.reduce(
                (sum, i) => sum + i.vendorAmount,
                0,
              );
              result.push({
                shopId: shop.id,
                shopName: shop.name,
                commissionRate: shop.commissionRate,
                pendingItems: items.length,
                totalAmount,
              });
            }
          }

          return Response.json({ shops: result });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to get pending',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
