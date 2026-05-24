import { createFileRoute } from '@tanstack/react-router';
import { createAuditLog } from '@/lib/audit-log';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/customers/$id')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              banned: true,
              banReason: true,
              banExpires: true,
              imageUrl: true,
              emailVerified: true,
              createdAt: true,
              _count: { select: { orders: true, reviews: true } },
            },
          });

          if (!user) {
            return Response.json(
              { error: 'Customer not found' },
              { status: 404 },
            );
          }

          const recentOrders = await prisma.order.findMany({
            where: { customerId: params.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              createdAt: true,
            },
          });

          const totalSpent = await prisma.order.aggregate({
            where: { customerId: params.id, paymentStatus: 'PAID' },
            _sum: { total: true },
          });

          return Response.json({
            customer: user,
            recentOrders,
            totalSpent: totalSpent._sum.total ?? 0,
          });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
          );
        }
      },

      PUT: async ({ request, params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (
            !session?.user ||
            (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')
          ) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const existing = await prisma.user.findUnique({
            where: { id: params.id },
          });
          if (!existing) {
            return Response.json(
              { error: 'Customer not found' },
              { status: 404 },
            );
          }

          const body = await request.json();
          const { banned, banReason, banExpires, role } = body;

          if (banned !== undefined && banned) {
            await createAuditLog({
              actorId: session.user.id,
              actorRole: session.user.role,
              action: 'USER_BANNED',
              entity: 'User',
              entityId: params.id,
              details: { reason: banReason, name: existing.name },
              ipAddress: headers.get('x-forwarded-for') || undefined,
            });
          }

          if (role && role !== existing.role) {
            await createAuditLog({
              actorId: session.user.id,
              actorRole: session.user.role,
              action: 'USER_ROLE_CHANGED',
              entity: 'User',
              entityId: params.id,
              details: { from: existing.role, to: role, name: existing.name },
              ipAddress: headers.get('x-forwarded-for') || undefined,
            });
          }

          const user = await prisma.user.update({
            where: { id: params.id },
            data: {
              ...(banned !== undefined && { banned }),
              ...(banReason !== undefined && {
                banReason: banReason || null,
              }),
              ...(banExpires !== undefined && {
                banExpires: banExpires ? new Date(banExpires) : null,
              }),
              ...(role !== undefined && { role }),
            },
          });

          return Response.json({ customer: user });
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
