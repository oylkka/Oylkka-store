import { createFileRoute } from '@tanstack/react-router';
import {
  type BkashExecutePaymentResult,
  executeBkashPayment,
  queryBkashPayment,
} from '@/lib/bkash';
import { prisma } from '@/lib/db';
import { generateInvoicePdf } from '@/lib/invoice-pdf';

export const Route = createFileRoute('/api/checkout/bkash-ipn')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body: { paymentID?: string; trxID?: string; status?: string } =
            await request.json();

          const paymentID = body.paymentID;

          if (!paymentID) {
            return Response.json(
              { error: 'paymentID is required' },
              { status: 400 },
            );
          }

          // Query bKash for the actual payment status
          const status = await queryBkashPayment(paymentID);

          if (status.transactionStatus === 'Completed') {
            // Find the order by paymentID in metadata
            const order = await prisma.order.findFirst({
              where: {
                metadata: {
                  path: ['bkashPaymentID'],
                  equals: paymentID,
                },
              },
              include: { items: true },
            });

            if (!order) {
              return Response.json(
                { error: 'Order not found' },
                { status: 404 },
              );
            }

            // Only process if still pending (prevent double-processing)
            if (order.paymentStatus !== 'PENDING') {
              return Response.json(
                { message: 'Payment already processed' },
                { status: 200 },
              );
            }

            // Execute payment confirmation
            let executeResult: BkashExecutePaymentResult | null = null;
            try {
              executeResult = await executeBkashPayment(paymentID);
            } catch {
              return Response.json(
                { error: 'Failed to execute payment' },
                { status: 500 },
              );
            }

            if (executeResult.transactionStatus !== 'Completed') {
              return Response.json(
                { error: 'Payment not completed' },
                { status: 400 },
              );
            }

            // Process the order in a transaction
            const metadata = order.metadata as Record<string, unknown> | null;
            const appliedVouchers =
              (metadata?.appliedVouchers as Array<{
                userVoucherId: string;
                couponId: string;
              }>) || [];
            const cashbackAmount = (metadata?.cashbackAmount as number) || 0;

            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: order.id },
                data: {
                  paymentStatus: 'PAID',
                  status: 'CONFIRMED',
                  paidAt: new Date(),
                  confirmedAt: new Date(),
                  paymentRef: executeResult.trxID,
                  metadata: {
                    ...(metadata || {}),
                    bkashTrxID: executeResult.trxID,
                    bkashPaymentStatus: executeResult.transactionStatus,
                  },
                },
              });

              // Decrement stock with re-validation
              for (const item of order.items) {
                const current = await tx.product.findUnique({
                  where: { id: item.productId },
                  select: { stock: true },
                });

                if (!current || current.stock < item.quantity) {
                  throw new Error(
                    `Product "${item.productName}" is out of stock`,
                  );
                }

                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity } },
                });

                if (item.variantId) {
                  const variantCurrent = await tx.productVariant.findUnique({
                    where: { id: item.variantId },
                    select: { stock: true },
                  });

                  if (!variantCurrent || variantCurrent.stock < item.quantity) {
                    throw new Error(
                      `Variant "${item.variantName}" is out of stock`,
                    );
                  }

                  await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } },
                  });
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

            generateInvoicePdf(order.id);

            return Response.json(
              { message: 'Payment processed successfully' },
              { status: 200 },
            );
          }

          // Payment not completed — no action needed
          return Response.json(
            {
              message: 'Payment not completed',
              status: status.transactionStatus,
            },
            { status: 200 },
          );
        } catch {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
