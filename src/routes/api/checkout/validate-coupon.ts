import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { couponLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';
import { checkCouponEligibility } from '@/services/checkout/coupon-validator';
import {
  calculateDiscount,
  type DiscountCartItem,
} from '@/services/checkout/discount-calculator';

export const Route = createFileRoute('/api/checkout/validate-coupon')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const rateLimitResponse = await checkRateLimit(couponLimiter);
          if (rateLimitResponse) return rateLimitResponse;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body: {
            code: string;
            subtotal: number;
            cartItems?: {
              productId: string;
              quantity: number;
              shopId?: string;
            }[];
            paymentMethod?: string;
            platform?: string;
          } = await request.json();

          if (!body.code) {
            return Response.json(
              { error: 'Coupon code is required' },
              { status: 400 },
            );
          }

          const code = body.code.trim().toUpperCase();

          const coupon = await prisma.coupon.findUnique({
            where: { code },
            include: { tiers: { orderBy: { minQuantity: 'asc' } } },
          });

          if (!coupon) {
            return Response.json(
              { valid: false, error: 'Invalid coupon code' },
              { status: 200 },
            );
          }

          const cartItems =
            body.cartItems ||
            (
              await prisma.cart.findUnique({
                where: { userId: session.user.id },
                include: {
                  items: {
                    include: {
                      product: {
                        select: { id: true, shopId: true, price: true },
                      },
                    },
                  },
                },
              })
            )?.items ||
            [];

          const totalQty = cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          if (body.subtotal <= 0) {
            return Response.json(
              { valid: false, error: 'Cart is empty or invalid' },
              { status: 200 },
            );
          }

          // Check basic eligibility
          const eligibility = checkCouponEligibility(coupon, {
            now: new Date(),
            subtotal: body.subtotal,
            totalQty,
            cartItems: cartItems.map((i) => ({
              productId: i.product.id,
              quantity: i.quantity,
            })),
            paymentMethod: body.paymentMethod,
            userAgent: headers.get('user-agent') || undefined,
            customerOrderCount: await prisma.order.count({
              where: { customerId: session.user.id },
            }),
          });

          if (eligibility) {
            return Response.json(
              { valid: false, error: eligibility },
              { status: 200 },
            );
          }

          // maxUsesPerUser check (unique to this route)
          if (coupon.maxUsesPerUser > 0) {
            const userUsageCount = await prisma.couponUsage.count({
              where: {
                couponId: coupon.id,
                userId: session.user.id,
              },
            });

            if (userUsageCount >= coupon.maxUsesPerUser) {
              return Response.json(
                {
                  valid: false,
                  error: 'You have already used this coupon',
                },
                { status: 200 },
              );
            }
          }

          // Calculate discount
          const discountItems: DiscountCartItem[] = cartItems.map((item) => ({
            productId: item.product.id,
            shopId: item.product.shopId ?? undefined,
            price: item.product.price,
            quantity: item.quantity,
          }));

          const result = calculateDiscount(
            coupon,
            discountItems,
            body.subtotal,
            totalQty,
          );

          return Response.json(
            {
              valid: true,
              couponId: coupon.id,
              code: coupon.code,
              description: coupon.description,
              type: coupon.type,
              value: coupon.value,
              discountAmount: result.discountAmount,
              maxDiscount: coupon.maxDiscount,
              shippingDiscount: coupon.shippingDiscount || 0,
              freeShipping: coupon.freeShipping,
              cashbackAmount: result.cashbackAmount,
              tierUsed: result.tierUsed,
              bogoApplied: result.bogoApplied,
              scope: coupon.scope,
              scopeId: coupon.scopeId,
              autoApply: coupon.autoApply,
              minQuantity: coupon.minQuantity,
              minOrderAmount: coupon.minOrderAmount,
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
