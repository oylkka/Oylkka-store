import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import type { OrderMetadata } from '@/types/orders';

export const Route = createFileRoute('/api/orders/admin-single')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const url = new URL(request.url);
          const orderId = url.searchParams.get('orderId');

          if (!orderId) {
            return Response.json(
              { error: 'orderId is required' },
              { status: 400 },
            );
          }

          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              customer: { select: { name: true, email: true } },
              items: {
                include: {
                  shop: { select: { name: true } },
                },
              },
            },
          });

          if (!order) {
            return Response.json({ error: 'Order not found' }, { status: 404 });
          }

          const metadata = order.metadata as OrderMetadata | null;

          const data = {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            paymentRef: order.paymentRef,
            total: order.total,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            discountAmount: order.discountAmount,
            couponDiscount: order.couponDiscount,
            couponCode: order.couponCode,
            customerId: order.customerId,
            customerName: order.customer.name,
            customerEmail: order.customer.email,
            shippingName: order.shippingName,
            shippingEmail: order.shippingEmail,
            shippingPhone: order.shippingPhone,
            shippingAddress: order.shippingAddress,
            shippingUpzila: order.shippingUpzila,
            shippingDistrict: order.shippingDistrict,
            shippingPostalCode: order.shippingPostalCode,
            shippingComment: order.shippingComment,
            createdAt: order.createdAt.toISOString(),
            confirmedAt: order.confirmedAt?.toISOString() ?? null,
            paidAt: order.paidAt?.toISOString() ?? null,
            cancelledAt: order.cancelledAt?.toISOString() ?? null,
            cancelledBy: order.cancelledBy,
            cancellationReason: order.cancellationReason,
            refundAmount: order.refundAmount,
            refundReason: order.refundReason,
            refundedAt: order.refundedAt?.toISOString() ?? null,
            currency: order.currency,
            bkashPaymentID: (metadata?.bkashPaymentID as string) ?? null,
            bkashTrxID: (metadata?.bkashTrxID as string) ?? null,
            items: order.items.map((item) => ({
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
