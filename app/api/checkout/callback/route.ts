import { type NextRequest, NextResponse } from 'next/server';

import { bkashConfig } from '@/lib/bkash';
import { db } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@/prisma/output';
import { executePayment, queryPayment } from '@/services/bkash';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const query = req.nextUrl.searchParams;
    const paymentID = query.get('paymentID');
    const status = query.get('status');
    const statusMessage = query.get('statusMessage');
    const myUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!paymentID) {
      return NextResponse.redirect(
        `${myUrl}/dashboard/order/cancel?error=no_payment_id`,
        303,
      );
    }

    // First, find the associated order by the payment ID in metadata
    let order = await db.order.findFirst({
      where: {
        AND: [
          {
            metadata: {
              equals: {
                bkashPaymentID: paymentID,
              },
            },
          },
        ],
      },
    });

    // If payment status is not success, handle failure scenarios
    if (status && status !== 'success') {
      if (order) {
        // Update the order with failure information
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.FAILED,
            metadata: {
              // biome-ignore lint: error
              ...((order.metadata as Record<string, any>) || {}),
              paymentFailedAt: new Date().toISOString(),
              paymentFailureReason:
                statusMessage || 'Payment was not successful',
              paymentFailureStatus: status,
            },
          },
        });
      }

      return NextResponse.redirect(
        `${myUrl}/dashboard/order/cancel?reason=${encodeURIComponent(statusMessage || 'Payment failed')}`,
        303,
      );
    }

    // Execute the payment to complete the transaction
    const executePaymentResponse = await executePayment(bkashConfig, paymentID);

    // If execution fails, try to query the payment status as a fallback
    if (executePaymentResponse.statusCode !== '0000') {
      // Query payment status as a fallback
      const queryResponse = await queryPayment(bkashConfig, paymentID);

      // Check if payment actually succeeded despite execution failure
      if (
        queryResponse.statusCode === '0000' &&
        queryResponse.transactionStatus === 'Completed'
      ) {
        // Use the query response data instead
        const orderNumber = queryResponse.merchantInvoiceNumber;

        if (!orderNumber) {
          return NextResponse.redirect(
            `${myUrl}/dashboard/order/cancel?error=no_order_reference`,
            303,
          );
        }

        // Find the order if we don't have it yet
        if (!order) {
          order = await db.order.findUnique({
            where: { orderNumber },
          });

          if (!order) {
            return NextResponse.redirect(
              `${myUrl}/dashboard/order/cancel?error=order_not_found`,
              303,
            );
          }
        }

        // Update order with success information
        // biome-ignore lint: error
        const currentMetadata = (order.metadata as Record<string, any>) || {};
        const updatedOrder = await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.PROCESSING,
            metadata: {
              ...currentMetadata,
              bkashTransactionId: queryResponse.trxID,
              paymentId: paymentID,
              paymentExecuteTime: new Date().toISOString(),
              paymentComplete: true,
              bkashResponse: queryResponse,
              paymentPending: false,
              executionFailedButQuerySucceeded: true,
            },
          },
        });

        await db.cartItem.deleteMany({
          where: { userId: order.userId },
        });

        // Update product stock
        await updateProductStock(order.id);

        return NextResponse.redirect(
          `${myUrl}/dashboard/order/order-confirmation?orderId=${updatedOrder.orderNumber}`,
          303,
        );
      } else {
        // Both execution and query show failure - handle payment failure

        // Get order number from the failed execution response
        const orderNumber = executePaymentResponse.merchantInvoiceNumber;

        // If we have an order number, update the order
        if (orderNumber) {
          // Find the order if we don't have it yet
          if (!order) {
            order = await db.order.findUnique({
              where: { orderNumber },
            });
          }

          if (order) {
            // Update order with failure information

            const currentMetadata =
              // biome-ignore lint: error
              (order.metadata as Record<string, any>) || {};
            await db.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: PaymentStatus.FAILED,
                metadata: {
                  ...currentMetadata,
                  paymentFailedResponse: executePaymentResponse,
                  paymentQueryResponse: queryResponse,
                  failedAt: new Date().toISOString(),
                },
              },
            });
          }
        }

        return NextResponse.redirect(
          `${myUrl}/dashboard/order/cancel?error=${encodeURIComponent(executePaymentResponse.statusMessage || 'Payment execution failed')}`,
          303,
        );
      }
    }

    // Payment execution succeeded
    const orderNumber = executePaymentResponse.merchantInvoiceNumber;

    // Find the order if we don't have it yet
    if (!order) {
      order = await db.order.findUnique({
        where: { orderNumber },
      });

      if (!order) {
        return NextResponse.redirect(
          `${myUrl}/dashboard/order/cancel?error=order_not_found`,
          303,
        );
      }
    }

    // Update the order with payment details
    // biome-ignore lint: error
    const currentMetadata = (order.metadata as Record<string, any>) || {};
    const updatedOrder = await db.order.update({
      where: { id: order.id },
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

    // Update product stock
    await updateProductStock(order.id);

    // Redirect to success page
    return NextResponse.redirect(
      `${myUrl}/dashboard/order/order-confirmation?orderId=${updatedOrder.orderNumber}`,
      303,
    );
    // biome-ignore lint: error
  } catch (error) {
    const myUrl = process.env.NEXT_PUBLIC_SITE_URL;
    return NextResponse.redirect(
      `${myUrl}/dashboard/order/cancel?error=server_error`,
      303,
    );
  }
}

// Helper function to update product stock
async function updateProductStock(orderId: string) {
  try {
    // Get order items
    const orderItems = await db.orderItem.findMany({
      where: { orderId: orderId },
    });

    // Update stock for each product
    for (const item of orderItems) {
      await db.product.update({
        where: { id: item.productSku },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
    // biome-ignore lint: error
  } catch (error) {}
}
