import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const Route = createFileRoute('/api/vendor/analytics/overview')({
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
            return Response.json({ error: 'No shop found' }, { status: 404 });
          }

          const twelveMonthsAgo = monthsAgo(12);

          const [
            revenueAgg,
            orderStats,
            pendingOrders,
            monthlyRevenue,
            recentOrders,
            topProducts,
          ] = await Promise.all([
            prisma.orderItem.aggregate({
              where: {
                shopId: shop.id,
                fulfillmentStatus: { not: 'CANCELLED' },
              },
              _sum: { vendorAmount: true, commissionAmount: true },
            }),
            prisma.orderItem.groupBy({
              by: ['fulfillmentStatus'],
              where: { shopId: shop.id },
              _count: true,
            }),
            prisma.orderItem.count({
              where: {
                shopId: shop.id,
                fulfillmentStatus: 'PENDING',
              },
            }),
            prisma.orderItem.findMany({
              where: {
                shopId: shop.id,
                fulfillmentStatus: { not: 'CANCELLED' },
                createdAt: { gte: twelveMonthsAgo },
              },
              select: {
                vendorAmount: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'asc' },
            }),
            prisma.orderItem.findMany({
              where: { shopId: shop.id },
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: {
                id: true,
                productName: true,
                quantity: true,
                total: true,
                fulfillmentStatus: true,
                createdAt: true,
                order: { select: { orderNumber: true } },
              },
            }),
            prisma.orderItem.groupBy({
              by: ['productName'],
              where: {
                shopId: shop.id,
                fulfillmentStatus: { not: 'CANCELLED' },
              },
              _sum: { quantity: true, vendorAmount: true },
              orderBy: { _sum: { vendorAmount: 'desc' } },
              take: 5,
            }),
          ]);

          const monthlyMap: Record<string, number> = {};
          for (let i = 0; i < 12; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            monthlyMap[
              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            ] = 0;
          }
          for (const item of monthlyRevenue) {
            const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyMap[key] !== undefined) {
              monthlyMap[key] += item.vendorAmount;
            }
          }
          const chartData = Object.entries(monthlyMap).map(
            ([month, amount]) => ({
              month,
              amount,
            }),
          );

          const totalOrders = orderStats.reduce((sum, s) => sum + s._count, 0);
          const fulfilledOrders =
            orderStats.find((s) => s.fulfillmentStatus === 'DELIVERED')
              ?._count || 0;

          return Response.json({
            stats: {
              revenue: revenueAgg._sum.vendorAmount ?? 0,
              commission: revenueAgg._sum.commissionAmount ?? 0,
              totalOrders,
              fulfilledOrders,
              pendingOrders,
              products: shop.totalSales,
            },
            monthlyRevenue: chartData,
            recentOrders: recentOrders.map((o) => ({
              id: o.id,
              orderNumber: o.order.orderNumber,
              productName: o.productName,
              quantity: o.quantity,
              total: o.total,
              status: o.fulfillmentStatus,
              createdAt: o.createdAt,
            })),
            topProducts: topProducts.map((p) => ({
              name: p.productName,
              quantity: p._sum.quantity ?? 0,
              revenue: p._sum.vendorAmount ?? 0,
            })),
          });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
          );
        }
      },
    },
  },
});
