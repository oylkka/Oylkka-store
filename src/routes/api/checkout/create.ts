import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';
import { sendOrderConfirmation } from '@/actions/send-order-email';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { generateInvoicePdf } from '@/lib/invoice-pdf';
import { checkoutLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}${rand}`;
}

const checkoutSchema = z.object({
  shippingName: z.string().min(1, 'Full name is required'),
  shippingEmail: z.string().email('Invalid email address'),
  shippingPhone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/, 'Invalid BD phone number'),
  shippingAddress: z.string().min(1, 'Address is required'),
  shippingUpzila: z.string().min(1, 'Upzila / Thana is required'),
  shippingDistrict: z.string().min(1, 'District is required'),
  shippingPostalCode: z
    .string()
    .regex(/^\d{4}$/, 'Postal code must be 4 digits')
    .optional()
    .or(z.literal('')),
  shippingComment: z.string().optional(),
  paymentMethod: z.enum(['BKASH', 'CASH_ON_DELIVERY', 'WALLET']),
  voucherIds: z.array(z.string()).optional(),
});

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

          const rateLimitResponse = await checkRateLimit(checkoutLimiter);
          if (rateLimitResponse) return rateLimitResponse;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body = await request.json();

          const parsed = checkoutSchema.safeParse(body);
          if (!parsed.success) {
            const firstError = parsed.error.errors[0];
            return Response.json(
              { error: firstError?.message || 'Invalid input' },
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

          // --- Price re-validation: check if prices changed since adding to cart ---
          const priceChangedItems: string[] = [];
          for (const item of cart.items) {
            const currentPrice =
              item.variant?.discountPrice ??
              item.variant?.price ??
              item.product.discountPrice ??
              item.product.price;
            const savedPrice = item.savedPrice;

            if (savedPrice != null && savedPrice !== currentPrice) {
              priceChangedItems.push(item.product.productName);
            }
          }

          if (priceChangedItems.length > 0) {
            return Response.json(
              {
                error: `Prices have changed for: ${priceChangedItems.join(', ')}. Please review your cart and try again.`,
                changedItems: priceChangedItems,
              },
              { status: 409 },
            );
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

          // --- Shipping calculation (zone-aware) ---
          const shopShippingMap = new Map<
            string,
            {
              cost: number;
              hasNonFree: boolean;
              itemQty: number;
              shopSubtotal: number;
            }
          >();

          const shippingDistrict = parsed.data.shippingDistrict;

          for (const item of cart.items) {
            const shop = item.product.shop;
            const shopId = shop?.id;
            if (!shopId) continue;

            const unitPrice =
              item.variant?.discountPrice ??
              item.variant?.price ??
              item.product.discountPrice ??
              item.product.price;

            if (!shopShippingMap.has(shopId)) {
              shopShippingMap.set(shopId, {
                cost: shop?.shippingCost ?? 0,
                hasNonFree: false,
                itemQty: 0,
                shopSubtotal: 0,
              });
            }

            // biome-ignore lint/style/noNonNullAssertion: this is fine
            const entry = shopShippingMap.get(shopId)!;
            entry.shopSubtotal += unitPrice * item.quantity;

            if (!item.product.freeShipping) {
              entry.hasNonFree = true;
              entry.itemQty += item.quantity;
            }
          }

          let baseShipping = 0;
          for (const [shopId, entry] of shopShippingMap) {
            if (entry.hasNonFree) {
              let cost = entry.cost;

              // Look up matching shipping zone for per-item + freeAbove
              if (shippingDistrict) {
                const zone = await prisma.shippingZone.findFirst({
                  where: {
                    shopId,
                    isActive: true,
                    districts: { has: shippingDistrict },
                  },
                  select: { baseCost: true, perItem: true, freeAbove: true },
                });

                if (zone) {
                  cost = zone.baseCost + zone.perItem * entry.itemQty;
                  if (
                    zone.freeAbove != null &&
                    entry.shopSubtotal >= zone.freeAbove
                  ) {
                    cost = 0;
                  }
                }
              }

              baseShipping += cost;
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

          if (parsed.data.voucherIds && parsed.data.voucherIds.length > 0) {
            const userVouchers = await prisma.userVoucher.findMany({
              where: {
                id: { in: parsed.data.voucherIds },
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
                coupon.requiredPaymentMethod !== parsed.data.paymentMethod
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
                shippingName: parsed.data.shippingName,
                shippingEmail: parsed.data.shippingEmail,
                shippingPhone: parsed.data.shippingPhone,
                shippingAddress: parsed.data.shippingAddress,
                shippingUpzila: parsed.data.shippingUpzila,
                shippingDistrict: parsed.data.shippingDistrict,
                shippingPostalCode: parsed.data.shippingPostalCode ?? null,
                shippingComment: parsed.data.shippingComment ?? null,
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
                paymentMethod: parsed.data.paymentMethod,
                paymentStatus:
                  parsed.data.paymentMethod === 'WALLET' ? 'PAID' : 'PENDING',
                paidAt:
                  parsed.data.paymentMethod === 'WALLET' ? new Date() : null,
                status:
                  parsed.data.paymentMethod === 'CASH_ON_DELIVERY' ||
                  parsed.data.paymentMethod === 'WALLET'
                    ? 'CONFIRMED'
                    : 'PENDING',
                confirmedAt:
                  parsed.data.paymentMethod === 'CASH_ON_DELIVERY' ||
                  parsed.data.paymentMethod === 'WALLET'
                    ? new Date()
                    : null,
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

            // For COD and WALLET: immediate side effects (stock, cart, vouchers, cashback)
            // For BKASH these happen after payment confirmation in bkash-callback.ts
            if (
              parsed.data.paymentMethod === 'CASH_ON_DELIVERY' ||
              parsed.data.paymentMethod === 'WALLET'
            ) {
              // Wallet payment: check balance and debit
              if (parsed.data.paymentMethod === 'WALLET') {
                const wallet = await tx.wallet.findUnique({
                  where: { userId: session.user.id },
                });

                if (!wallet) {
                  throw new Error('Wallet not found');
                }

                if (wallet.balance < total) {
                  throw new Error(
                    `Insufficient wallet balance. Your balance: ৳${wallet.balance.toFixed(2)}, required: ৳${total.toFixed(2)}`,
                  );
                }

                await tx.wallet.update({
                  where: { id: wallet.id },
                  data: { balance: { decrement: total } },
                });

                await tx.walletTransaction.create({
                  data: {
                    walletId: wallet.id,
                    type: 'DEBIT',
                    amount: total,
                    reference: 'ORDER_PAYMENT',
                    orderId: created.id,
                    description: `Payment for order ${orderNumber}`,
                  },
                });
              }

              // Decrement stock with re-validation inside transaction (race condition safety)
              for (const item of cart.items) {
                const current = await tx.product.findUnique({
                  where: { id: item.product.id },
                  select: { stock: true },
                });

                if (!current || current.stock < item.quantity) {
                  throw new Error(
                    `"${item.product.productName}" is out of stock`,
                  );
                }

                await tx.product.update({
                  where: { id: item.product.id },
                  data: { stock: { decrement: item.quantity } },
                });

                if (item.variant) {
                  const variantCurrent = await tx.productVariant.findUnique({
                    where: { id: item.variant.id },
                    select: { stock: true },
                  });

                  if (!variantCurrent || variantCurrent.stock < item.quantity) {
                    throw new Error(`"${item.variant.name}" is out of stock`);
                  }

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

          // Fire-and-forget: send order confirmation email + generate invoice for confirmed orders
          if (
            parsed.data.paymentMethod === 'CASH_ON_DELIVERY' ||
            parsed.data.paymentMethod === 'WALLET'
          ) {
            sendOrderConfirmation(order.id);
            generateInvoicePdf(order.id);
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
