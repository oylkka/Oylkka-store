import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type {
  CartWithItems,
  VoucherWithCoupon,
} from '@/services/checkout/voucher-processor';
import {
  processVouchers,
  sumVoucherTotals,
} from '@/services/checkout/voucher-processor';

export const Route = createFileRoute('/api/checkout/discount-preview')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const body: {
            voucherIds: string[];
            paymentMethod: string;
            cart: CartWithItems;
            subtotal: number;
          } = await request.json();

          // Compute base shipping estimate (avoids duplicating this logic on the client)
          const groupedByShop = body.cart.items.reduce<
            Record<string, { items: typeof body.cart.items }>
          >((groups, item) => {
            const shopId = item.product.shop?.id;
            if (!shopId) return groups;
            if (!groups[shopId]) groups[shopId] = { items: [] };
            groups[shopId].items.push(item);
            return groups;
          }, {});

          const shippingEstimates = await Promise.all(
            Object.entries(groupedByShop).map(async ([shopId, { items }]) => {
              const shop = await prisma.shop.findUnique({
                where: { id: shopId },
                select: { shippingCost: true },
              });
              if (!shop) return 0;
              const hasNonFree = items.some(
                (item) => !item.product.freeShipping,
              );
              return hasNonFree ? Number(shop.shippingCost) : 0;
            }),
          );
          const baseShipping = shippingEstimates.reduce(
            (sum, cost) => sum + cost,
            0,
          );

          let totalDiscount = 0;
          let totalShippingDiscount = 0;
          let freeShipping = false;

          if (body.voucherIds?.length) {
            const customerOrderCount = await prisma.order.count({
              where: { customerId: session.user.id },
            });

            const userVouchers = await prisma.userVoucher.findMany({
              where: {
                id: { in: body.voucherIds },
                userId: session.user.id,
                usedAt: null,
              },
              include: {
                coupon: {
                  include: { tiers: { orderBy: { minQuantity: 'asc' } } },
                },
              },
            });

            const result = processVouchers(
              userVouchers as unknown as VoucherWithCoupon[],
              body.cart,
              body.subtotal,
              {
                paymentMethod: body.paymentMethod,
                customerOrderCount,
                userAgent: headers.get('user-agent') || undefined,
              },
            );

            const { totalCouponDiscount } = sumVoucherTotals(result);
            totalDiscount = Math.min(totalCouponDiscount, body.subtotal);
            totalShippingDiscount = result.reduce(
              (sum, v) => sum + v.shippingDiscount,
              0,
            );
            freeShipping = result.some((v) => v.freeShipping);
          }

          return Response.json({
            baseShipping,
            totalDiscount,
            totalShippingDiscount,
            freeShipping,
          });
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
