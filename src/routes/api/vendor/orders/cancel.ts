import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { createAuditLog } from '@/lib/audit-log';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { orderCancellationHtml } from '@/lib/email-templates';
import { sendEmail } from '@/lib/send-email';
import { incrementStock, incrementVariantStock } from '@/lib/stock';

export const Route = createFileRoute('/api/vendor/orders/cancel')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop) {
            return Response.json({ error: 'No shop found' }, { status: 404 });
          }

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

          const order = await prisma.order.findFirst({
            where: { id: body.orderId },
            include: {
              items: {
                where: { shopId: shop.id },
              },
            },
          });

          if (!order) {
            return Response.json({ error: 'Order not found' }, { status: 404 });
          }

          if (order.items.length === 0) {
            return Response.json(
              { error: 'No items from your shop in this order' },
              { status: 404 },
            );
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

          if (order.paymentStatus === 'PAID' || order.status === 'CONFIRMED') {
            return Response.json(
              {
                error:
                  'Order has been paid. Contact admin to cancel and refund.',
              },
              { status: 400 },
            );
          }

          // Only allow cancelling vendor's own items
          const itemIds = order.items.map((i) => i.id);

          await prisma.$transaction(async (tx) => {
            await tx.orderItem.updateMany({
              where: { id: { in: itemIds } },
              data: { fulfillmentStatus: 'CANCELLED' },
            });

            // Restore stock
            for (const item of order.items) {
              await incrementStock(tx, item.productId, item.quantity);
              if (item.variantId) {
                await incrementVariantStock(tx, item.variantId, item.quantity);
              }
            }

            // Check if all items are now cancelled — mark entire order cancelled
            const remainingActive = await tx.orderItem.count({
              where: {
                orderId: body.orderId,
                fulfillmentStatus: { not: 'CANCELLED' },
              },
            });

            if (remainingActive === 0) {
              await tx.order.update({
                where: { id: body.orderId },
                data: {
                  status: 'CANCELLED',
                  cancelledAt: new Date(),
                  cancelledBy: session.user.id,
                  cancellationReason: body.reason,
                },
              });
            }
          });

          createAuditLog({
            actorId: session.user.id,
            actorRole: 'VENDOR',
            action: 'ORDER_CANCELLED',
            entity: 'Order',
            entityId: body.orderId,
            details: {
              reason: body.reason,
              orderNumber: order.orderNumber,
              shopId: shop.id,
              itemIds,
            },
          }).catch((e) => {
            // biome-ignore lint/suspicious/noConsole: this is fine
            console.error('Failed to create audit log:', e);
          });

          sendEmail({
            to: order.shippingEmail,
            subject: `Order #${order.orderNumber} — Item(s) Cancelled`,
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
          }).catch((e) => {
            // biome-ignore lint/suspicious/noConsole: this is fine
            console.error('Failed to send cancellation email:', e);
          });

          return Response.json({ success: true }, { status: 200 });
        } catch (_error) {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
