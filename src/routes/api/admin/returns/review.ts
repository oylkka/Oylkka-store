import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/returns/review')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

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
                  customerId: true,
                  total: true,
                  refundAmount: true,
                  paymentMethod: true,
                  paymentStatus: true,
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
              returnRequest.order.total -
                (returnRequest.order.refundAmount ?? 0);

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
              (returnRequest.order.refundAmount ?? 0) + amount;
            const fullyRefunded = newRefundAmount >= returnRequest.order.total;

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
          }

          const updated = await prisma.returnRequest.update({
            where: { id: returnId },
            data: updateData,
          });

          return Response.json({ return: updated });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to review return request',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
