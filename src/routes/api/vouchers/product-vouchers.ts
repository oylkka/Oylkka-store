import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vouchers/product-vouchers')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const body: { productId: string } = await request.json();

          if (!body.productId) {
            return Response.json(
              { error: 'Product ID is required' },
              { status: 400 },
            );
          }

          const product = await prisma.product.findUnique({
            where: { id: body.productId },
            select: { id: true, shopId: true, categoryId: true },
          });

          if (!product) {
            return Response.json(
              { error: 'Product not found' },
              { status: 404 },
            );
          }

          const now = new Date();

          const applicableCoupons = await prisma.coupon.findMany({
            where: {
              isActive: true,
              expiresAt: { gt: now },
              OR: [{ startsAt: null }, { startsAt: { lte: now } }],
              AND: [
                {
                  OR: [
                    { scope: 'GLOBAL' },
                    { scope: 'SHOP', scopeId: product.shopId },
                    { scope: 'PRODUCT', scopeId: body.productId },
                    { scope: 'CATEGORY', scopeId: product.categoryId },
                    { scope: 'ALL' },
                  ],
                },
                {
                  OR: [
                    { maxUses: 0 },
                    { usedCount: { lt: prisma.coupon.fields.maxUses } },
                  ],
                },
                {
                  OR: [
                    { maxClaimCount: 0 },
                    {
                      claimedCount: { lt: prisma.coupon.fields.maxClaimCount },
                    },
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
              minOrderAmount: true,
              minQuantity: true,
              freeShipping: true,
              shippingDiscount: true,
              scope: true,
              scopeId: true,
              autoApply: true,
            },
          });

          const userId = session.user.id;

          const collectedIds = await prisma.userVoucher.findMany({
            where: {
              userId,
              couponId: { in: applicableCoupons.map((c) => c.id) },
              usedAt: null,
            },
            select: { couponId: true },
          });

          const collectedSet = new Set(collectedIds.map((c) => c.couponId));

          const vouchers = applicableCoupons.map((coupon) => ({
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
