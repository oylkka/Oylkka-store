import { createFileRoute } from '@tanstack/react-router';
import { createAuditLog } from '@/lib/audit-log';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { orderCancellationHtml } from '@/lib/email-templates';
import { sendEmail } from '@/lib/send-email';

export const Route = createFileRoute('/api/orders/admin-cancel')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;
          const session = authResult.session;

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

          sendEmail({
            to: order.shippingEmail,
            subject: `Order #${order.orderNumber} Cancelled`,
            meta: {
              description: '',
              link: '',
              callToActionText: '',
            },
            html: orderCancellationHtml(
              {
                orderNumber: order.orderNumber,
                customerName: order.shippingName,
              },
              body.reason,
              order.items.map((i) => ({
                productName: i.productName,
                quantity: i.quantity,
              })),
            ),
          });

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
