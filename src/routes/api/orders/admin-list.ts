import { createFileRoute } from '@tanstack/react-router';
import type { Prisma } from '@/generated/prisma/client';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/orders/admin-list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const url = new URL(request.url);
          const status = url.searchParams.get('status') || undefined;
          const paymentStatus =
            url.searchParams.get('paymentStatus') || undefined;
          const search = url.searchParams.get('search') || undefined;
          const customer = url.searchParams.get('customer') || undefined;
          const vendor = url.searchParams.get('vendor') || undefined;
          const dateFrom = url.searchParams.get('dateFrom') || undefined;
          const dateTo = url.searchParams.get('dateTo') || undefined;
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            100,
            Math.max(1, Number(url.searchParams.get('limit')) || 20),
          );
          const skip = (page - 1) * limit;

          const where: Prisma.OrderWhereInput = {};

          if (status) where.status = status;
          if (paymentStatus) where.paymentStatus = paymentStatus;

          if (search) {
            where.orderNumber = { contains: search, mode: 'insensitive' };
          }

          if (customer) {
            where.customer = {
              OR: [
                { name: { contains: customer, mode: 'insensitive' } },
                { email: { contains: customer, mode: 'insensitive' } },
              ],
            };
          }

          if (vendor) {
            where.items = {
              some: {
                shop: { name: { contains: vendor, mode: 'insensitive' } },
              },
            };
          }

          if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) where.createdAt.lte = new Date(dateTo);
          }

          const [orders, total, stats] = await Promise.all([
            prisma.order.findMany({
              where,
              include: {
                customer: { select: { name: true, email: true } },
                items: {
                  take: 1,
                  select: { imageUrl: true },
                },
                _count: { select: { items: true } },
              },
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            }),
            prisma.order.count({ where }),
            prisma.order.aggregate({
              where: {},
              _sum: { total: true },
              _count: { _all: true },
            }),
          ]);

          const pendingCount = await prisma.order.count({
            where: { status: 'PENDING' },
          });

          const data = {
            orders: orders.map((o) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              customerName: o.customer.name,
              customerEmail: o.customer.email,
              total: o.total,
              paymentStatus: o.paymentStatus,
              paymentMethod: o.paymentMethod,
              status: o.status,
              itemCount: o._count.items,
              createdAt: o.createdAt.toISOString(),
              firstItemImage: o.items[0]?.imageUrl ?? null,
            })),
            total,
            totalRevenue: stats._sum.total ?? 0,
            pendingCount,
            page,
            totalPages: Math.ceil(total / limit),
          };

          return Response.json(data, { status: 200 });
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
