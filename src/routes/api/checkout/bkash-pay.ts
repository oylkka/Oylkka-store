import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { createBkashPayment } from '@/lib/bkash';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/checkout/bkash-pay')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({ headers });

        if (!session?.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: { orderId: string } = await request.json();

        if (!body.orderId) {
          return Response.json(
            { error: 'Order ID is required' },
            { status: 400 },
          );
        }

        const order = await prisma.order.findUnique({
          where: { id: body.orderId },
        });

        if (!order) {
          return Response.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.customerId !== session.user.id) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (order.paymentMethod !== 'BKASH') {
          return Response.json(
            { error: 'This order is not set for bKash payment' },
            { status: 400 },
          );
        }

        if (order.paymentStatus !== 'PENDING') {
          return Response.json(
            { error: 'Payment already processed' },
            { status: 400 },
          );
        }

        try {
          const baseUrl =
            process.env.BETTER_AUTH_URL || `http://localhost:3000`;

          const result = await createBkashPayment({
            amount: order.total,
            orderId: order.id,
            merchantInvoiceNumber: order.orderNumber,
            callbackURL: `${baseUrl}/api/checkout/bkash-callback?orderId=${order.id}`,
          });

          if (result.statusCode && result.statusCode !== '0000') {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'FAILED',
                metadata: {
                  ...(order.metadata as Record<string, unknown>),
                  bkashPaymentID: result.paymentID,
                  bkashError: result.statusMessage || result.statusCode,
                },
              },
            });

            return Response.json(
              {
                error:
                  result.statusMessage || 'bKash payment initiation failed',
              },
              { status: 400 },
            );
          }

          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentRef: result.merchantInvoiceNumber,
              metadata: {
                ...(order.metadata as Record<string, unknown>),
                bkashPaymentID: result.paymentID,
                bkashCheckoutURL: result.bkashURL,
              },
            },
          });

          return Response.json(
            { checkoutURL: result.bkashURL },
            { status: 200 },
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'bKash payment failed';

          await prisma.order
            .update({
              where: { id: order.id },
              data: {
                paymentStatus: 'FAILED',
                metadata: {
                  ...(order.metadata as Record<string, unknown>),
                  bkashError: message,
                },
              },
            })
            .catch(() => {});

          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
