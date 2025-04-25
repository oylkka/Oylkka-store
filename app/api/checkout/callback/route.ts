// callback.ts (GET handler)
import { NextRequest, NextResponse } from 'next/server';

import { bkashConfig } from '@/lib/bkash';
import { db } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@/prisma/output';
import { executePayment } from '@/services/bkash';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams;
    const paymentID = query.get('paymentID');
    const myUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!paymentID) {
      return NextResponse.redirect(`${myUrl}/cancel`, 303);
    }

    const executePaymentResponse = await executePayment(bkashConfig, paymentID);

    if (executePaymentResponse.statusCode !== '0000') {
      // Update the order status to FAILED
      if (executePaymentResponse.merchantInvoiceNumber) {
        await db.order.update({
          where: { orderNumber: executePaymentResponse.merchantInvoiceNumber },
          data: {
            paymentStatus: PaymentStatus.FAILED,
            metadata: {
              paymentFailedResponse: executePaymentResponse,
              failedAt: new Date().toISOString(),
            },
          },
        });
      }

      return NextResponse.redirect(`${myUrl}/dashboard/order/cancel`, 303);
    }

    const orderNumber = executePaymentResponse.merchantInvoiceNumber;

    // Find the order
    const order = await db.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      console.error('Order not found for:', orderNumber);
      return NextResponse.redirect(
        `${myUrl}/dashboard/order/cancel?error=order_not_found`,
        303
      );
    }

    // Update the order with payment details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMetadata = (order.metadata as Record<string, any>) || {};
    const updatedOrder = await db.order.update({
      where: { orderNumber },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
        metadata: {
          ...currentMetadata,
          bkashTransactionId: executePaymentResponse.trxID,
          paymentId: executePaymentResponse.paymentID,
          paymentExecuteTime: new Date().toISOString(),
          paymentComplete: true,
          bkashResponse: executePaymentResponse,
          paymentPending: false,
        },
      },
    });

    return NextResponse.redirect(
      `${myUrl}/dashboard/order/order-confirmation?orderId=${updatedOrder.orderNumber}`,
      303
    );
  } catch (error) {
    console.error('Callback processing error:', error);
    const myUrl = process.env.NEXT_PUBLIC_SITE_URL;
    return NextResponse.redirect(`${myUrl}/cancel?error=server_error`, 303);
  }
}
