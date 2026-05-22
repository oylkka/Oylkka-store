import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { createAuditLog } from '@/lib/audit-log';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/orders/admin-cancel')({
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
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body: { orderId: string; reason: string } =
            await request.json();

          if (!body.orderId) {
            return Response.json(
              { error: 'orderId is required' },
              { status: 400 },
            );
          }

          if (!body.reason?.trim()) {
            return Response.json(
              { error: 'Cancellation reason is required' },
              { status: 400 },
            );
          }

          const order = await prisma.order.findUnique({
            where: { id: body.orderId },
            include: { items: true },
          });

          if (!order) {
            return Response.json({ error: 'Order not found' }, { status: 404 });
          }

          if (
            order.status === 'CANCELLED' ||
            order.status === 'REFUNDED' ||
            order.status === 'DELIVERED'
          ) {
            return Response.json(
              { error: `Order is already ${order.status.toLowerCase()}` },
              { status: 400 },
            );
          }

          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: body.orderId },
              data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancelledBy: session.user.id,
                cancellationReason: body.reason,
                items: {
                  updateMany: {
                    where: { orderId: body.orderId },
                    data: { fulfillmentStatus: 'CANCELLED' },
                  },
                },
              },
            });

            // Restore stock only if it was previously decremented
            if (order.status !== 'PENDING') {
              for (const item of order.items) {
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                });

                if (item.variantId) {
                  await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { increment: item.quantity } },
                  });
                }
              }
            }
          });

          createAuditLog({
            actorId: session.user.id,
            actorRole: session.user.role,
            action: 'ORDER_CANCELLED',
            entity: 'Order',
            entityId: body.orderId,
            details: { reason: body.reason, orderNumber: order.orderNumber },
          }).catch(() => {});

          return Response.json({ success: true }, { status: 200 });
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
