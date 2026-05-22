import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { couponLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

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

          if (!coupon.isActive) {
            return Response.json(
              { valid: false, error: 'This coupon is no longer active' },
              { status: 200 },
            );
          }

          const now = new Date();

          if (coupon.expiresAt && coupon.expiresAt < now) {
            return Response.json(
              { valid: false, error: 'This coupon has expired' },
              { status: 200 },
            );
          }

          if (coupon.startsAt && coupon.startsAt > now) {
            return Response.json(
              { valid: false, error: 'This coupon is not yet valid' },
              { status: 200 },
            );
          }

          if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
            return Response.json(
              {
                valid: false,
                error: 'This coupon has reached its usage limit',
              },
              { status: 200 },
            );
          }

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

          if (
            coupon.maxClaimCount > 0 &&
            coupon.claimedCount >= coupon.maxClaimCount
          ) {
            return Response.json(
              {
                valid: false,
                error: 'This voucher is no longer available (all claimed)',
              },
              { status: 200 },
            );
          }

          if (coupon.firstOrderOnly) {
            const orderCount = await prisma.order.count({
              where: { customerId: session.user.id },
            });

            if (orderCount > 0) {
              return Response.json(
                {
                  valid: false,
                  error: 'This coupon is for first-time buyers only',
                },
                { status: 200 },
              );
            }
          }

          if (coupon.repeatPurchaseOnly) {
            const orderCount = await prisma.order.count({
              where: { customerId: session.user.id },
            });

            if (orderCount === 0) {
              return Response.json(
                {
                  valid: false,
                  error: 'This coupon is for repeat customers only',
                },
                { status: 200 },
              );
            }
          }

          if (coupon.requiredPaymentMethod) {
            if (
              !body.paymentMethod ||
              body.paymentMethod !== coupon.requiredPaymentMethod
            ) {
              return Response.json(
                {
                  valid: false,
                  error: `This coupon requires ${coupon.requiredPaymentMethod} payment`,
                },
                { status: 200 },
              );
            }
          }

          if (coupon.platformRestriction !== 'ALL') {
            const userAgent = headers.get('user-agent') || '';
            const isMobile =
              /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
                userAgent,
              );

            if (coupon.platformRestriction === 'MOBILE_ONLY' && !isMobile) {
              return Response.json(
                {
                  valid: false,
                  error: 'This coupon is available on mobile app only',
                },
                { status: 200 },
              );
            }

            if (coupon.platformRestriction === 'WEB_ONLY' && isMobile) {
              return Response.json(
                {
                  valid: false,
                  error: 'This coupon is available on web only',
                },
                { status: 200 },
              );
            }
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

          if (coupon.minQuantity) {
            if (coupon.scope === 'PRODUCT' && coupon.scopeId) {
              const scopedQty = cartItems
                .filter((item) => item.product.id === coupon.scopeId)
                .reduce((sum, item) => sum + item.quantity, 0);

              if (scopedQty < coupon.minQuantity) {
                return Response.json(
                  {
                    valid: false,
                    error: `Need ${coupon.minQuantity} of this product (${scopedQty} in cart)`,
                    minQuantity: coupon.minQuantity,
                    currentQuantity: scopedQty,
                  },
                  { status: 200 },
                );
              }
            } else {
              if (totalQty < coupon.minQuantity) {
                return Response.json(
                  {
                    valid: false,
                    error: `Minimum ${coupon.minQuantity} items required (${totalQty} in cart)`,
                    minQuantity: coupon.minQuantity,
                    currentQuantity: totalQty,
                  },
                  { status: 200 },
                );
              }
            }
          }

          if (coupon.minOrderAmount && body.subtotal < coupon.minOrderAmount) {
            return Response.json(
              {
                valid: false,
                error: `Minimum order amount is ৳${coupon.minOrderAmount.toLocaleString()}`,
              },
              { status: 200 },
            );
          }

          if (body.subtotal <= 0) {
            return Response.json(
              { valid: false, error: 'Cart is empty or invalid' },
              { status: 200 },
            );
          }

          // --- Calculate discount ---
          let discountAmount = 0;
          let tierUsed: {
            minQuantity: number;
            value: number;
            type?: string;
          } | null = null;
          let bogoApplied: {
            buyQty: number;
            freeQty: number;
            freeItemPrice: number;
          } | null = null;
          let cashbackAmount = 0;

          // Check tiers first
          if (coupon.tiers.length > 0) {
            const matchingTier = [...coupon.tiers]
              .reverse()
              .find((t) => totalQty >= t.minQuantity);

            if (matchingTier) {
              const tierType = matchingTier.type || coupon.type;
              if (tierType === 'PERCENTAGE') {
                discountAmount = (body.subtotal * matchingTier.value) / 100;
                if (coupon.maxDiscount) {
                  discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                }
              } else if (tierType === 'FIXED') {
                discountAmount = Math.min(matchingTier.value, body.subtotal);
              } else if (tierType === 'CASHBACK') {
                cashbackAmount = (body.subtotal * matchingTier.value) / 100;
                if (coupon.maxDiscount) {
                  cashbackAmount = Math.min(cashbackAmount, coupon.maxDiscount);
                }
              }

              tierUsed = {
                minQuantity: matchingTier.minQuantity,
                value: matchingTier.value,
                type: tierType,
              };
            }
          }

          // No tier matched or no tiers — use coupon-level value
          if (!tierUsed) {
            if (coupon.type === 'PERCENTAGE') {
              discountAmount = (body.subtotal * coupon.value) / 100;
              if (coupon.maxDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
              }
            } else if (coupon.type === 'FIXED') {
              discountAmount = Math.min(coupon.value, body.subtotal);
            } else if (coupon.type === 'CASHBACK') {
              cashbackAmount = (body.subtotal * coupon.value) / 100;
              if (coupon.maxDiscount) {
                cashbackAmount = Math.min(cashbackAmount, coupon.maxDiscount);
              }
            }
          }

          // BOGO — calculate free items discount
          if (coupon.bogoBuyQty && coupon.bogoFreeQty) {
            const scopedItems = coupon.scopeId
              ? cartItems.filter(
                  (item) =>
                    item.product.id === coupon.scopeId ||
                    item.product.shopId === coupon.scopeId,
                )
              : cartItems;

            const totalScopedQty = scopedItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );

            if (totalScopedQty >= coupon.bogoBuyQty) {
              const freeBatches = Math.floor(
                totalScopedQty / coupon.bogoBuyQty,
              );
              const maxFreeItems = freeBatches * coupon.bogoFreeQty;

              const sortedByPrice = [...scopedItems].sort(
                (a, b) => a.product.price - b.product.price,
              );

              let remainingFree = maxFreeItems;
              let totalFreeValue = 0;
              for (const item of sortedByPrice) {
                if (remainingFree <= 0) break;
                const take = Math.min(remainingFree, item.quantity);
                totalFreeValue += take * item.product.price;
                remainingFree -= take;
              }

              discountAmount += totalFreeValue;
              bogoApplied = {
                buyQty: coupon.bogoBuyQty,
                freeQty: coupon.bogoFreeQty * freeBatches,
                freeItemPrice: totalFreeValue,
              };
            }
          }

          discountAmount = Math.round(discountAmount * 100) / 100;
          cashbackAmount = Math.round(cashbackAmount * 100) / 100;

          return Response.json(
            {
              valid: true,
              couponId: coupon.id,
              code: coupon.code,
              description: coupon.description,
              type: coupon.type,
              value: coupon.value,
              discountAmount,
              maxDiscount: coupon.maxDiscount,
              shippingDiscount: coupon.shippingDiscount || 0,
              freeShipping: coupon.freeShipping,
              cashbackAmount,
              tierUsed,
              bogoApplied,
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
