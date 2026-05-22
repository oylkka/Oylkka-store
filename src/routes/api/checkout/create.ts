import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { sendOrderConfirmation } from '@/actions/send-order-email';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}${rand}`;
}

type CreateOrderInput = {
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingUpzila: string;
  shippingDistrict: string;
  shippingPostalCode?: string;
  shippingComment?: string;
  paymentMethod: 'BKASH' | 'CASH_ON_DELIVERY';
  voucherIds?: string[];
};

export const Route = createFileRoute('/api/checkout/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const body: CreateOrderInput = await request.json();

          if (
            !body.shippingName ||
            !body.shippingEmail ||
            !body.shippingPhone
          ) {
            return Response.json(
              { error: 'Shipping name, email, and phone are required' },
              { status: 400 },
            );
          }

          if (
            !body.shippingAddress ||
            !body.shippingUpzila ||
            !body.shippingDistrict
          ) {
            return Response.json(
              { error: 'Shipping address is incomplete' },
              { status: 400 },
            );
          }

          if (
            !body.paymentMethod ||
            !['BKASH', 'CASH_ON_DELIVERY'].includes(body.paymentMethod)
          ) {
            return Response.json(
              { error: 'Invalid payment method' },
              { status: 400 },
            );
          }

          const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      productName: true,
                      slug: true,
                      price: true,
                      discountPrice: true,
                      stock: true,
                      freeShipping: true,
                      images: {
                        take: 1,
                        orderBy: { order: 'asc' },
                        select: { imageUrl: true },
                      },
                      shop: {
                        select: {
                          id: true,
                          name: true,
                          commissionRate: true,
                          shippingCost: true,
                        },
                      },
                    },
                  },
                  variant: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                      discountPrice: true,
                      stock: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          });

          if (!cart || cart.items.length === 0) {
            return Response.json({ error: 'Cart is empty' }, { status: 400 });
          }

          for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
              return Response.json(
                {
                  error: `"${item.product.productName}" has insufficient stock. Available: ${item.product.stock}`,
                },
                { status: 400 },
              );
            }

            if (item.variant && item.variant.stock < item.quantity) {
              return Response.json(
                {
                  error: `"${item.variant.name}" has insufficient stock. Available: ${item.variant.stock}`,
                },
                { status: 400 },
              );
            }
          }

          // --- Calculate base pricing ---
          const orderNumber = generateOrderNumber();

          let subtotal = 0;
          let totalDiscount = 0;

          for (const item of cart.items) {
            const unitPrice =
              item.variant?.discountPrice ??
              item.variant?.price ??
              item.product.discountPrice ??
              item.product.price;
            const savedPrice = item.savedPrice ?? unitPrice;
            const discount = unitPrice - savedPrice;

            subtotal += unitPrice * item.quantity;
            totalDiscount += discount * item.quantity;
          }

          // --- Shipping calculation ---
          const shopShippingMap = new Map<
            string,
            { cost: number; hasNonFree: boolean }
          >();

          for (const item of cart.items) {
            const shopId = item.product.shop?.id;
            if (!shopId) continue;

            if (!shopShippingMap.has(shopId)) {
              shopShippingMap.set(shopId, {
                cost: item.product.shop?.shippingCost ?? 0,
                hasNonFree: false,
              });
            }

            if (!item.product.freeShipping) {
              // biome-ignore lint/style/noNonNullAssertion: this is fine
              const entry = shopShippingMap.get(shopId)!;
              entry.hasNonFree = true;
            }
          }

          let baseShipping = 0;
          for (const [, entry] of shopShippingMap) {
            if (entry.hasNonFree) {
              baseShipping += entry.cost;
            }
          }

          // --- Voucher validation & application ---
          const selectedVouchers: {
            id: string;
            couponId: string;
            code: string;
            discountAmount: number;
            shippingDiscount: number;
            freeShipping: boolean;
            cashbackAmount: number;
            scope: string;
            scopeId: string | null;
            tierUsed: {
              minQuantity: number;
              value: number;
              type?: string;
            } | null;
            bogoApplied: {
              buyQty: number;
              freeQty: number;
              freeItemPrice: number;
            } | null;
          }[] = [];

          const now = new Date();

          if (body.voucherIds && body.voucherIds.length > 0) {
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

            // Group by scope for stacking rules
            const globalCoupons: string[] = [];
            const shopCoupons = new Map<string, string>(); // shopId -> couponId
            const productCoupons = new Map<string, string>(); // productId -> couponId
            let _hasFreeShippingVoucher = false;

            for (const uv of userVouchers) {
              const coupon = uv.coupon;

              // Re-validate
              if (!coupon.isActive) continue;
              if (coupon.expiresAt && coupon.expiresAt < now) continue;
              if (coupon.startsAt && coupon.startsAt > now) continue;
              if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
                continue;

              // Stacking rules
              if (coupon.scope === 'GLOBAL') {
                if (globalCoupons.length > 0) continue;
                globalCoupons.push(coupon.id);
              } else if (coupon.scope === 'SHOP' && coupon.scopeId) {
                if (shopCoupons.has(coupon.scopeId)) continue;
                shopCoupons.set(coupon.scopeId, coupon.id);
              } else if (coupon.scope === 'PRODUCT' && coupon.scopeId) {
                if (productCoupons.has(coupon.scopeId)) continue;
                productCoupons.set(coupon.scopeId, coupon.id);
              }

              // Calculate discount
              let discountAmount = 0;
              let cashbackAmount = 0;
              let tierUsed = null;
              let bogoApplied = null;

              const totalQty = cart.items.reduce((s, i) => s + i.quantity, 0);
              const effectiveScopeId = coupon.scopeId;
              const scopedItems = cart.items.filter(
                (item) =>
                  !effectiveScopeId ||
                  item.product.id === effectiveScopeId ||
                  item.product.shop?.id === effectiveScopeId,
              );
              const scopedSubtotal = scopedItems.reduce(
                (s, item) =>
                  s + (item.savedPrice ?? item.product.price) * item.quantity,
                0,
              );

              // Check minQuantity
              if (coupon.minQuantity) {
                let qtyOk = false;
                if (coupon.scope === 'PRODUCT' && coupon.scopeId) {
                  const scopedQty = cart.items
                    .filter((i) => i.product.id === coupon.scopeId)
                    .reduce((s, i) => s + i.quantity, 0);
                  qtyOk = scopedQty >= coupon.minQuantity;
                } else {
                  qtyOk = totalQty >= coupon.minQuantity;
                }
                if (!qtyOk) continue;
              }

              // Check minOrderAmount
              if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount)
                continue;

              // Check maxClaimCount
              if (
                coupon.maxClaimCount > 0 &&
                coupon.claimedCount >= coupon.maxClaimCount
              )
                continue;

              // Check firstOrderOnly
              if (coupon.firstOrderOnly) {
                const count = await prisma.order.count({
                  where: { customerId: session.user.id },
                });
                if (count > 0) continue;
              }

              // Check repeatPurchaseOnly
              if (coupon.repeatPurchaseOnly) {
                const count = await prisma.order.count({
                  where: { customerId: session.user.id },
                });
                if (count === 0) continue;
              }

              // Check requiredPaymentMethod
              if (
                coupon.requiredPaymentMethod &&
                coupon.requiredPaymentMethod !== body.paymentMethod
              )
                continue;

              // Check platformRestriction
              if (coupon.platformRestriction !== 'ALL') {
                const userAgent = headers.get('user-agent') || '';
                const isMobile =
                  /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
                    userAgent,
                  );
                if (coupon.platformRestriction === 'MOBILE_ONLY' && !isMobile)
                  continue;
                if (coupon.platformRestriction === 'WEB_ONLY' && isMobile)
                  continue;
              }

              // Calculate discount — tiers
              if (coupon.tiers.length > 0) {
                const matchingTier = [...coupon.tiers]
                  .reverse()
                  .find((t) => totalQty >= t.minQuantity);
                if (matchingTier) {
                  const tType = matchingTier.type || coupon.type;
                  if (tType === 'PERCENTAGE') {
                    discountAmount =
                      (scopedSubtotal * matchingTier.value) / 100;
                    if (coupon.maxDiscount) {
                      discountAmount = Math.min(
                        discountAmount,
                        coupon.maxDiscount,
                      );
                    }
                  } else if (tType === 'FIXED') {
                    discountAmount = Math.min(
                      matchingTier.value,
                      scopedSubtotal,
                    );
                  } else if (tType === 'CASHBACK') {
                    cashbackAmount =
                      (scopedSubtotal * matchingTier.value) / 100;
                    if (coupon.maxDiscount) {
                      cashbackAmount = Math.min(
                        cashbackAmount,
                        coupon.maxDiscount,
                      );
                    }
                  }
                  tierUsed = {
                    minQuantity: matchingTier.minQuantity,
                    value: matchingTier.value,
                    type: tType,
                  };
                }
              }

              // No tier — use coupon value
              if (!tierUsed) {
                if (coupon.type === 'PERCENTAGE') {
                  discountAmount = (scopedSubtotal * coupon.value) / 100;
                  if (coupon.maxDiscount) {
                    discountAmount = Math.min(
                      discountAmount,
                      coupon.maxDiscount,
                    );
                  }
                } else if (coupon.type === 'FIXED') {
                  discountAmount = Math.min(coupon.value, scopedSubtotal);
                } else if (coupon.type === 'CASHBACK') {
                  cashbackAmount = (scopedSubtotal * coupon.value) / 100;
                  if (coupon.maxDiscount) {
                    cashbackAmount = Math.min(
                      cashbackAmount,
                      coupon.maxDiscount,
                    );
                  }
                }
              }

              // BOGO
              if (coupon.bogoBuyQty && coupon.bogoFreeQty) {
                const bogoItems = effectiveScopeId
                  ? cart.items.filter(
                      (item) =>
                        item.product.id === effectiveScopeId ||
                        item.product.shop?.id === effectiveScopeId,
                    )
                  : cart.items;

                const totalBogoQty = bogoItems.reduce(
                  (s, i) => s + i.quantity,
                  0,
                );
                if (totalBogoQty >= coupon.bogoBuyQty) {
                  const freeBatches = Math.floor(
                    totalBogoQty / coupon.bogoBuyQty,
                  );
                  const maxFreeItems = freeBatches * coupon.bogoFreeQty;

                  const sortedByPrice = [...bogoItems].sort(
                    (a, b) => (a.product.price ?? 0) - (b.product.price ?? 0),
                  );

                  let remainingFree = maxFreeItems;
                  let totalFreeValue = 0;
                  for (const item of sortedByPrice) {
                    if (remainingFree <= 0) break;
                    const take = Math.min(remainingFree, item.quantity);
                    totalFreeValue += take * (item.product.price ?? 0);
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

              if (coupon.freeShipping) {
                _hasFreeShippingVoucher = true;
              }

              selectedVouchers.push({
                id: uv.id,
                couponId: coupon.id,
                code: coupon.code,
                discountAmount: Math.max(0, discountAmount),
                shippingDiscount: coupon.shippingDiscount || 0,
                freeShipping: coupon.freeShipping,
                cashbackAmount: Math.max(0, cashbackAmount),
                scope: coupon.scope,
                scopeId: effectiveScopeId,
                tierUsed,
                bogoApplied,
              });
            }
          }

          // --- Apply shipping discounts ---
          let finalShipping = baseShipping;

          if (selectedVouchers.some((v) => v.freeShipping)) {
            finalShipping = 0;
          } else {
            for (const v of selectedVouchers) {
              finalShipping = Math.max(0, finalShipping - v.shippingDiscount);
            }
          }

          // --- Apply discount stacking ---
          let totalCouponDiscount = 0;
          let totalCashback = 0;

          for (const v of selectedVouchers) {
            totalCouponDiscount += v.discountAmount;
            totalCashback += v.cashbackAmount;
          }

          // Cap discount at subtotal
          totalCouponDiscount = Math.min(totalCouponDiscount, subtotal);

          const tax = 0;
          const total =
            subtotal -
            totalDiscount -
            totalCouponDiscount +
            finalShipping +
            tax;

          // --- Create order in transaction ---
          const appliedVouchersData = selectedVouchers.map((v) => ({
            userVoucherId: v.id,
            couponId: v.couponId,
            code: v.code,
            discountAmount: v.discountAmount,
            shippingDiscount: v.shippingDiscount,
            freeShipping: v.freeShipping,
            cashbackAmount: v.cashbackAmount,
            scope: v.scope,
            scopeId: v.scopeId,
            tierUsed: v.tierUsed,
            bogoApplied: v.bogoApplied,
          }));

          const order = await prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
              data: {
                orderNumber,
                customerId: session.user.id,
                shippingName: body.shippingName,
                shippingEmail: body.shippingEmail,
                shippingPhone: body.shippingPhone,
                shippingAddress: body.shippingAddress,
                shippingUpzila: body.shippingUpzila,
                shippingDistrict: body.shippingDistrict,
                shippingPostalCode: body.shippingPostalCode ?? null,
                shippingComment: body.shippingComment ?? null,
                subtotal,
                discountAmount: totalDiscount,
                couponCode:
                  selectedVouchers.map((v) => v.code).join(',') || null,
                couponDiscount:
                  totalCouponDiscount > 0 ? totalCouponDiscount : null,
                shippingCost: finalShipping,
                tax,
                total,
                currency: 'BDT',
                paymentMethod: body.paymentMethod,
                status:
                  body.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'CONFIRMED'
                    : 'PENDING',
                confirmedAt:
                  body.paymentMethod === 'CASH_ON_DELIVERY' ? new Date() : null,
                metadata: {
                  appliedVouchers: appliedVouchersData,
                  cashbackAmount: totalCashback,
                },
                items: {
                  create: cart.items.map((item) => {
                    const unitPrice =
                      item.variant?.discountPrice ??
                      item.variant?.price ??
                      item.product.discountPrice ??
                      item.product.price;
                    const savedPrice = item.savedPrice ?? unitPrice;
                    const discountPrice =
                      savedPrice < unitPrice ? savedPrice : null;
                    const lineTotal = savedPrice * item.quantity;
                    const commissionRate =
                      item.product.shop?.commissionRate ?? 10;
                    const commissionAmount = (lineTotal * commissionRate) / 100;
                    const vendorAmount = lineTotal - commissionAmount;

                    return {
                      shopId: item.product.shop?.id ?? '',
                      productId: item.product.id,
                      variantId: item.variant?.id ?? null,
                      productName: item.product.productName,
                      variantName: item.variant?.name ?? null,
                      imageUrl:
                        item.product.images[0]?.imageUrl ??
                        item.variant?.imageUrl ??
                        null,
                      quantity: item.quantity,
                      unitPrice,
                      discountPrice,
                      total: lineTotal,
                      commissionRate,
                      commissionAmount,
                      vendorAmount,
                    };
                  }),
                },
              },
              include: { items: true },
            });

            // Only for COD: destructive side effects (stock, cart, vouchers, cashback)
            // For BKASH these happen after payment confirmation in bkash-callback.ts
            if (body.paymentMethod === 'CASH_ON_DELIVERY') {
              // Decrement stock
              for (const item of cart.items) {
                await tx.product.update({
                  where: { id: item.product.id },
                  data: { stock: { decrement: item.quantity } },
                });

                if (item.variant) {
                  await tx.productVariant.update({
                    where: { id: item.variant.id },
                    data: { stock: { decrement: item.quantity } },
                  });
                }
              }

              // Clear cart
              await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
              });

              // Create CouponUsage + mark UserVoucher used
              for (const v of selectedVouchers) {
                await tx.couponUsage.create({
                  data: {
                    couponId: v.couponId,
                    userId: session.user.id,
                    orderId: created.id,
                  },
                });

                await tx.coupon.update({
                  where: { id: v.couponId },
                  data: { usedCount: { increment: 1 } },
                });

                await tx.userVoucher.update({
                  where: { id: v.id },
                  data: { usedAt: now, orderId: created.id },
                });
              }

              // Handle cashback
              if (totalCashback > 0) {
                let wallet = await tx.wallet.findUnique({
                  where: { userId: session.user.id },
                });

                if (!wallet) {
                  wallet = await tx.wallet.create({
                    data: { userId: session.user.id },
                  });
                }

                await tx.wallet.update({
                  where: { id: wallet.id },
                  data: { balance: { increment: totalCashback } },
                });

                await tx.walletTransaction.create({
                  data: {
                    walletId: wallet.id,
                    type: 'CREDIT',
                    amount: totalCashback,
                    reference: 'CASHBACK',
                    orderId: created.id,
                    description: `Cashback from vouchers: ${selectedVouchers.map((v) => v.code).join(', ')}`,
                  },
                });
              }
            }

            return created;
          });

          // Fire-and-forget: send order confirmation email for COD orders
          if (body.paymentMethod === 'CASH_ON_DELIVERY') {
            sendOrderConfirmation(order.id);
          }

          return Response.json(
            {
              orderId: order.id,
              orderNumber: order.orderNumber,
              total: order.total,
              subtotal: order.subtotal,
              discountAmount: order.discountAmount,
              couponDiscount: order.couponDiscount,
              shippingCost: order.shippingCost,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus,
              status: order.status,
              appliedVouchers: selectedVouchers.map((v) => ({
                code: v.code,
                discountAmount: v.discountAmount,
                shippingDiscount: v.shippingDiscount,
                freeShipping: v.freeShipping,
                cashbackAmount: v.cashbackAmount,
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
