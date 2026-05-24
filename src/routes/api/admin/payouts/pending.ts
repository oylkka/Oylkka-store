import { createFileRoute } from '@tanstack/react-router';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/payouts/pending')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdmin(authResult.session);
          if (roleResponse) return roleResponse;

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
                (sum, i) => sum + Number(i.vendorAmount),
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
