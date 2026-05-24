import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vouchers/auto-apply')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      price: true,
                      shopId: true,
                      freeShipping: true,
                    },
                  },
                },
              },
            },
          });

          if (!cart || cart.items.length === 0) {
            return Response.json({ vouchers: [] }, { status: 200 });
          }

          const shopIds = [
            ...new Set(cart.items.map((i) => i.product.shopId).filter(Boolean)),
          ];
          const productIds = cart.items.map((i) => i.product.id);
          const subtotal = cart.items.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
          );
          const totalQty = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          const now = new Date();

          const autoCoupons = await prisma.coupon.findMany({
            where: {
              autoApply: true,
              isActive: true,
              expiresAt: { gt: now },
              OR: [{ startsAt: null }, { startsAt: { lte: now } }],
              AND: [
                {
                  OR: [
                    { scope: 'GLOBAL' },
                    { scope: 'SHOP', scopeId: { in: shopIds } },
                    { scope: 'PRODUCT', scopeId: { in: productIds } },
                  ],
                },
                {
                  OR: [
                    { minOrderAmount: null },
                    { minOrderAmount: { lte: subtotal } },
                  ],
                },
                {
                  OR: [
                    { minQuantity: null },
                    { minQuantity: { lte: totalQty } },
                  ],
                },
                {
                  OR: [
                    { maxUses: 0 },
                    { usedCount: { lt: prisma.coupon.fields.maxUses } },
                  ],
                },
              ],
            },
            select: {
              id: true,
              code: true,
              description: true,
              type: true,
              value: true,
              maxDiscount: true,
              freeShipping: true,
              shippingDiscount: true,
              scope: true,
              scopeId: true,
            },
          });

          const userId = session.user.id;

          const collectedIds = await prisma.userVoucher.findMany({
            where: {
              userId,
              couponId: { in: autoCoupons.map((c) => c.id) },
              usedAt: null,
            },
            select: { couponId: true },
          });

          const collectedSet = new Set(collectedIds.map((c) => c.couponId));

          const vouchers = autoCoupons.map((coupon) => ({
            ...coupon,
            isCollected: collectedSet.has(coupon.id),
          }));

          return Response.json({ vouchers }, { status: 200 });
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
