import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const Route = createFileRoute('/api/admin/dashboard/stats')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const now = new Date();
          const thirtyDaysAgo = daysAgo(30);

          const [
            revenueAgg,
            totalOrders,
            pendingOrders,
            processingOrders,
            totalProducts,
            totalUsers,
            totalVendors,
            dailyRevenue,
            recentOrders,
          ] = await Promise.all([
            prisma.order.aggregate({
              where: { paymentStatus: 'PAID' },
              _sum: { total: true },
            }),
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'PROCESSING' } }),
            prisma.product.count(),
            prisma.user.count(),
            prisma.shop.count({ where: { status: 'ACTIVE' } }),
            prisma.order.groupBy({
              by: ['createdAt'],
              where: {
                paymentStatus: 'PAID',
                createdAt: { gte: thirtyDaysAgo },
              },
              _sum: { total: true },
              orderBy: { createdAt: 'asc' },
            }),
            prisma.order.findMany({
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: {
                customer: { select: { name: true, email: true } },
              },
            }),
          ]);

          const revenueByDay: Record<string, number> = {};
          for (let i = 0; i < 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i + 1);
            revenueByDay[d.toISOString().slice(0, 10)] = 0;
          }
          for (const r of dailyRevenue) {
            const key = r.createdAt.toISOString().slice(0, 10);
            if (revenueByDay[key] !== undefined) {
              revenueByDay[key] += r._sum.total ?? 0;
            }
          }
          const chartData = Object.entries(revenueByDay).map(
            ([date, amount]) => ({
              date,
              amount,
            }),
          );

          return Response.json({
            stats: {
              revenue: revenueAgg._sum.total ?? 0,
              orders: totalOrders,
              pendingOrders,
              processingOrders,
              products: totalProducts,
              users: totalUsers,
              vendors: totalVendors,
            },
            dailyRevenue: chartData,
            recentOrders: recentOrders.map((o) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              customerName: o.customer.name,
              total: o.total,
              status: o.status,
              createdAt: o.createdAt,
            })),
          });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to load dashboard stats',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
