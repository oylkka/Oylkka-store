import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { createAuditLog } from '@/lib/audit-log';
import { auth } from '@/lib/auth';
import { refundBkashPayment } from '@/lib/bkash';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/orders/admin-refund')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body: {
            orderId: string;
            amount: number;
            reason: string;
            itemIds?: string[];
          } = await request.json();

          if (!body.orderId) {
            return Response.json(
              { error: 'orderId is required' },
              { status: 400 },
            );
          }

          if (!body.amount || body.amount <= 0) {
            return Response.json(
              { error: 'Refund amount must be greater than 0' },
              { status: 400 },
            );
          }

          if (!body.reason?.trim()) {
            return Response.json(
              { error: 'Refund reason is required' },
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

          if (order.paymentStatus === 'REFUNDED') {
            return Response.json(
              { error: 'Order has already been fully refunded' },
              { status: 400 },
            );
          }

          const alreadyRefunded = order.refundAmount ?? 0;
          const totalRefunded = alreadyRefunded + body.amount;

          if (totalRefunded > order.total) {
            return Response.json(
              {
                error: `Refund amount exceeds order total. Already refunded: ৳${alreadyRefunded.toFixed(2)}, remaining: ৳${(order.total - alreadyRefunded).toFixed(2)}`,
              },
              { status: 400 },
            );
          }

          const isPartial = totalRefunded < order.total;
          const newPaymentStatus = isPartial
            ? 'PARTIALLY_REFUNDED'
            : 'REFUNDED';

          // For bKash orders, process the bKash refund first
          if (
            order.paymentMethod === 'BKASH' &&
            order.paymentStatus === 'PAID'
          ) {
            const metadata = order.metadata as Record<string, unknown> | null;
            const bkashPaymentID = metadata?.bkashPaymentID as
              | string
              | undefined;
            const bkashTrxID = metadata?.bkashTrxID as string | undefined;
            const paymentRef = order.paymentRef;

            if (bkashPaymentID && (bkashTrxID || paymentRef)) {
              await refundBkashPayment({
                paymentID: bkashPaymentID,
                trxID: (bkashTrxID || paymentRef) as string,
                amount: body.amount,
                reason: body.reason,
              });
            }
          }

          // For wallet orders, credit the refund back to wallet
          if (order.paymentMethod === 'WALLET') {
            let wallet = await prisma.wallet.findUnique({
              where: { userId: order.customerId },
            });

            if (!wallet) {
              wallet = await prisma.wallet.create({
                data: { userId: order.customerId },
              });
            }

            await prisma.wallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: body.amount } },
            });

            await prisma.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: 'CREDIT',
                amount: body.amount,
                reference: 'REFUND',
                orderId: order.id,
                description: `Refund for order ${order.orderNumber}: ${body.reason}`,
              },
            });
          }

          // Update the order and items in a transaction
          const updated = await prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
              where: { id: body.orderId },
              data: {
                paymentStatus: newPaymentStatus,
                refundAmount: totalRefunded,
                refundReason: body.reason,
                refundedAt: new Date(),
                ...(totalRefunded >= order.total ? { status: 'REFUNDED' } : {}),
              },
              include: {
                items: {
                  include: { shop: { select: { name: true } } },
                },
              },
            });

            // Restore stock for refunded items
            const itemsToRestore =
              body.itemIds && body.itemIds.length > 0
                ? order.items.filter((i) => body.itemIds?.includes(i.id))
                : order.items;

            for (const item of itemsToRestore) {
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

            // Mark specific items as refunded
            if (body.itemIds && body.itemIds.length > 0) {
              await tx.orderItem.updateMany({
                where: { id: { in: body.itemIds } },
                data: { fulfillmentStatus: 'REFUNDED' },
              });
            } else if (totalRefunded >= order.total) {
              // Full refund — mark all items as refunded
              await tx.orderItem.updateMany({
                where: { orderId: body.orderId },
                data: { fulfillmentStatus: 'REFUNDED' },
              });
            }

            return updatedOrder;
          });

          const metadata = updated.metadata as Record<string, unknown> | null;

          createAuditLog({
            actorId: session.user.id,
            actorRole: session.user.role,
            action: 'ORDER_REFUNDED',
            entity: 'Order',
            entityId: body.orderId,
            details: {
              amount: body.amount,
              reason: body.reason,
              itemIds: body.itemIds,
              orderNumber: order.orderNumber,
            },
          }).catch(() => {});

          return Response.json(
            {
              id: updated.id,
              orderNumber: updated.orderNumber,
              status: updated.status,
              paymentStatus: updated.paymentStatus,
              paymentMethod: updated.paymentMethod,
              paymentRef: updated.paymentRef,
              total: updated.total,
              subtotal: updated.subtotal,
              shippingCost: updated.shippingCost,
              discountAmount: updated.discountAmount,
              couponDiscount: updated.couponDiscount,
              couponCode: updated.couponCode,
              customerId: updated.customerId,
              shippingName: updated.shippingName,
              shippingEmail: updated.shippingEmail,
              shippingPhone: updated.shippingPhone,
              shippingAddress: updated.shippingAddress,
              shippingUpzila: updated.shippingUpzila,
              shippingDistrict: updated.shippingDistrict,
              shippingPostalCode: updated.shippingPostalCode,
              shippingComment: updated.shippingComment,
              createdAt: updated.createdAt.toISOString(),
              confirmedAt: updated.confirmedAt?.toISOString() ?? null,
              paidAt: updated.paidAt?.toISOString() ?? null,
              cancelledAt: updated.cancelledAt?.toISOString() ?? null,
              cancelledBy: updated.cancelledBy,
              cancellationReason: updated.cancellationReason,
              refundAmount: updated.refundAmount,
              refundReason: updated.refundReason,
              refundedAt: updated.refundedAt?.toISOString() ?? null,
              currency: updated.currency,
              bkashPaymentID: (metadata?.bkashPaymentID as string) ?? null,
              bkashTrxID: (metadata?.bkashTrxID as string) ?? null,
              items: updated.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                variantName: item.variantName,
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPrice: item.discountPrice,
                total: item.total,
                fulfillmentStatus: item.fulfillmentStatus,
                trackingNumber: item.trackingNumber,
                trackingUrl: item.trackingUrl,
                shippedAt: item.shippedAt?.toISOString() ?? null,
                deliveredAt: item.deliveredAt?.toISOString() ?? null,
                shopId: item.shopId,
                shopName: item.shop.name,
              })),
            },
            { status: 200 },
          );
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
