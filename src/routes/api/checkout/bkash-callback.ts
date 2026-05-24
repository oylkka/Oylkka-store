import { createFileRoute } from '@tanstack/react-router';
import { sendOrderConfirmation } from '@/actions/send-order-email';
import { executeBkashPayment } from '@/lib/bkash';
import { prisma } from '@/lib/db';
import { generateInvoicePdf } from '@/lib/invoice-pdf';
import { checkoutLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';
import { decrementStock, decrementVariantStock } from '@/lib/stock';

export const Route = createFileRoute('/api/checkout/bkash-callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const rateLimitResponse = await checkRateLimit(checkoutLimiter);
          if (rateLimitResponse) return rateLimitResponse;

          const url = new URL(request.url);
          const paymentID = url.searchParams.get('paymentID');
          const status = url.searchParams.get('status');
          const orderIdParam = url.searchParams.get('orderId');

          const baseUrl =
            process.env.BETTER_AUTH_URL || 'http://localhost:3000';

          if (status === 'cancel' || status === 'failure') {
            if (orderIdParam) {
              await prisma.order
                .update({
                  where: { id: orderIdParam },
                  data: { paymentStatus: 'FAILED' },
                })
                .catch(() => {});
            }
            const redirectUrl = orderIdParam
              ? `${baseUrl}/checkout/confirmation?orderId=${orderIdParam}&error=payment-cancelled`
              : `${baseUrl}/checkout?error=payment-cancelled`;
            return Response.redirect(redirectUrl);
          }

          if (!paymentID) {
            return Response.redirect(
              `${baseUrl}/checkout?error=invalid-payment`,
            );
          }

          const result = await executeBkashPayment(paymentID);

          // Find order by paymentRef or by metadata, including items for stock decrement
          let order = await prisma.order.findFirst({
            where: {
              paymentRef: result.merchantInvoiceNumber || paymentID,
            },
            include: { items: true },
          });

          if (!order) {
            order = await prisma.order.findFirst({
              where: {
                metadata: {
                  path: ['bkashPaymentID'],
                  equals: paymentID,
                },
              },
              include: { items: true },
            });
          }

          if (!order) {
            return Response.redirect(
              `${baseUrl}/checkout?error=order-not-found`,
            );
          }

          // Prevent replay — only process if payment is still pending
          if (order.paymentStatus !== 'PENDING') {
            return Response.redirect(
              `${baseUrl}/checkout/confirmation?orderId=${order.id}&error=payment-already-processed`,
            );
          }

          if (result.transactionStatus === 'Completed') {
            // Payment confirmed — finalize order with destructive side effects
            const metadata = order.metadata as Record<string, unknown> | null;
            const appliedVouchers =
              (metadata?.appliedVouchers as Array<{
                userVoucherId: string;
                couponId: string;
              }>) || [];
            const cashbackAmount = (metadata?.cashbackAmount as number) || 0;

            await prisma.$transaction(async (tx) => {
              // Update order to PAID/CONFIRMED
              await tx.order.update({
                where: { id: order.id },
                data: {
                  paymentStatus: 'PAID',
                  status: 'CONFIRMED',
                  paidAt: new Date(),
                  confirmedAt: new Date(),
                  paymentRef: result.trxID,
                  metadata: {
                    ...(metadata || {}),
                    bkashTrxID: result.trxID,
                    bkashPaymentStatus: result.transactionStatus,
                  },
                },
              });

              // Atomic stock decrement (race-condition-safe)
              for (const item of order.items) {
                await decrementStock(
                  tx,
                  item.productId,
                  item.quantity,
                  item.productName,
                );

                if (item.variantId) {
                  await decrementVariantStock(
                    tx,
                    item.variantId,
                    item.quantity,
                    item.variantName || 'variant',
                  );
                }
              }

              // Clear cart
              await tx.cartItem.deleteMany({
                where: { cart: { userId: order.customerId } },
              });

              // Mark vouchers as used
              for (const v of appliedVouchers) {
                await tx.couponUsage.create({
                  data: {
                    couponId: v.couponId,
                    userId: order.customerId,
                    orderId: order.id,
                  },
                });

                await tx.coupon.update({
                  where: { id: v.couponId },
                  data: { usedCount: { increment: 1 } },
                });

                if (v.userVoucherId) {
                  await tx.userVoucher.update({
                    where: { id: v.userVoucherId },
                    data: { usedAt: new Date(), orderId: order.id },
                  });
                }
              }

              // Credit cashback to wallet
              if (cashbackAmount > 0) {
                let wallet = await tx.wallet.findUnique({
                  where: { userId: order.customerId },
                });

                if (!wallet) {
                  wallet = await tx.wallet.create({
                    data: { userId: order.customerId },
                  });
                }

                await tx.wallet.update({
                  where: { id: wallet.id },
                  data: { balance: { increment: cashbackAmount } },
                });

                await tx.walletTransaction.create({
                  data: {
                    walletId: wallet.id,
                    type: 'CREDIT',
                    amount: cashbackAmount,
                    reference: 'CASHBACK',
                    orderId: order.id,
                    description: 'Cashback from vouchers',
                  },
                });
              }
            });

            // Fire-and-forget: send order confirmation email + generate invoice
            sendOrderConfirmation(order.id);
            generateInvoicePdf(order.id);

            return Response.redirect(
              `${baseUrl}/checkout/confirmation?orderId=${order.id}`,
            );
          }

          // Payment failed — mark order as FAILED
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: 'FAILED' },
          });

          return Response.redirect(
            `${baseUrl}/checkout/confirmation?orderId=${order.id}&error=payment-failed`,
          );
        } catch (_error) {
          const baseUrl =
            process.env.BETTER_AUTH_URL || 'http://localhost:3000';
          return Response.redirect(`${baseUrl}/checkout?error=payment-failed`);
        }
      },
    },
  },
});
