import { createFileRoute } from '@tanstack/react-router';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { orderRefundHtml } from '@/lib/email-templates';
import { sendEmail } from '@/lib/send-email';

export const Route = createFileRoute('/api/admin/returns/review')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdmin(authResult.session);
          if (roleResponse) return roleResponse;
          const session = authResult.session;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body = await request.json();
          const { returnId, status: newStatus, refundAmount, adminNote } = body;

          if (!returnId || !newStatus) {
            return Response.json(
              { error: 'returnId and status are required' },
              { status: 400 },
            );
          }

          const VALID_STATUSES = ['APPROVED', 'REJECTED', 'REFUNDED'];
          if (!VALID_STATUSES.includes(newStatus)) {
            return Response.json({ error: 'Invalid status' }, { status: 400 });
          }

          const returnRequest = await prisma.returnRequest.findUnique({
            where: { id: returnId },
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  customerId: true,
                  total: true,
                  refundAmount: true,
                  paymentMethod: true,
                  paymentStatus: true,
                  shippingName: true,
                  shippingEmail: true,
                },
              },
            },
          });

          if (!returnRequest) {
            return Response.json(
              { error: 'Return request not found' },
              { status: 404 },
            );
          }

          const updateData: Record<string, unknown> = {
            status: newStatus as never,
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
          };

          if (adminNote) updateData.adminNote = adminNote;

          // Process refund if status is REFUNDED
          if (newStatus === 'REFUNDED') {
            const amount =
              refundAmount ??
              Number(returnRequest.order.total) -
                Number(returnRequest.order.refundAmount ?? 0);

            if (amount <= 0) {
              return Response.json(
                { error: 'Refund amount must be positive' },
                { status: 400 },
              );
            }

            if (returnRequest.order.paymentMethod === 'WALLET') {
              // Credit the customer's wallet
              await prisma.$transaction(async (tx) => {
                const wallet = await tx.wallet.upsert({
                  where: { userId: returnRequest.order.customerId },
                  create: {
                    userId: returnRequest.order.customerId,
                    balance: amount,
                  },
                  update: {
                    balance: { increment: amount },
                  },
                });

                await tx.walletTransaction.create({
                  data: {
                    walletId: wallet.id,
                    type: 'CREDIT',
                    amount,
                    reference: 'REFUND',
                    orderId: returnRequest.orderId,
                    description: `Refund for return ${returnRequest.id}`,
                  },
                });
              });
            }

            const newRefundAmount =
              Number(returnRequest.order.refundAmount ?? 0) + amount;
            const fullyRefunded =
              newRefundAmount >= Number(returnRequest.order.total);

            await prisma.order.update({
              where: { id: returnRequest.orderId },
              data: {
                refundAmount: newRefundAmount,
                refundReason: returnRequest.details || 'Return refund',
                refundedAt: new Date(),
                paymentStatus: fullyRefunded
                  ? 'REFUNDED'
                  : 'PARTIALLY_REFUNDED',
                ...(fullyRefunded ? { status: 'REFUNDED' } : {}),
              },
            });

            // Mark order items as refunded
            if (returnRequest.itemIds.length > 0) {
              await prisma.orderItem.updateMany({
                where: { id: { in: returnRequest.itemIds } },
                data: { fulfillmentStatus: 'REFUNDED' },
              });
            }

            updateData.refundAmount = amount;

            sendEmail({
              to: returnRequest.order.shippingEmail,
              subject: `Refund Processed — #${returnRequest.order.orderNumber}`,
              meta: {
                description: '',
                link: '',
                callToActionText: '',
              },
              html: orderRefundHtml(
                {
                  orderNumber: returnRequest.order.orderNumber,
                  customerName: returnRequest.order.shippingName,
                },
                amount,
                returnRequest.details || 'Return refund',
                returnRequest.order.paymentMethod || 'CASH_ON_DELIVERY',
              ),
            });
          }

          const updated = await prisma.returnRequest.update({
            where: { id: returnId },
            data: updateData,
          });

          return Response.json({ return: updated });
        } catch (_error) {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
