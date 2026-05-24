import { createFileRoute } from '@tanstack/react-router';
import { sendOrderShippedNotification } from '@/actions/send-order-email';
import { createAuditLog } from '@/lib/audit-log';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

const FULFILLMENT_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export const Route = createFileRoute('/api/orders/admin-fulfill')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;
          const session = authResult.session;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body: {
            orderId: string;
            itemId: string;
            fulfillmentStatus: string;
            trackingNumber?: string;
            trackingUrl?: string;
          } = await request.json();

          if (!body.orderId) {
            return Response.json(
              { error: 'orderId is required' },
              { status: 400 },
            );
          }

          if (!body.itemId) {
            return Response.json(
              { error: 'itemId is required' },
              { status: 400 },
            );
          }

          const item = await prisma.orderItem.findFirst({
            where: { id: body.itemId, orderId: body.orderId },
          });

          if (!item) {
            return Response.json(
              { error: 'Order item not found' },
              { status: 404 },
            );
          }

          const allowedNext = FULFILLMENT_TRANSITIONS[item.fulfillmentStatus];
          if (
            !body.fulfillmentStatus ||
            !allowedNext ||
            !allowedNext.includes(body.fulfillmentStatus)
          ) {
            return Response.json(
              {
                error: `Cannot transition from ${item.fulfillmentStatus} to ${body.fulfillmentStatus}`,
              },
              { status: 400 },
            );
          }

          const updateData: Record<string, unknown> = {
            fulfillmentStatus: body.fulfillmentStatus,
          };

          if (body.fulfillmentStatus === 'SHIPPED') {
            updateData.trackingNumber = body.trackingNumber ?? null;
            updateData.trackingUrl = body.trackingUrl ?? null;
            updateData.shippedAt = new Date();
          }

          if (body.fulfillmentStatus === 'DELIVERED') {
            updateData.deliveredAt = new Date();
          }

          const updated = await prisma.$transaction(async (tx) => {
            const result = await tx.orderItem.update({
              where: { id: body.itemId },
              data: updateData,
            });
            return result;
          });

          // Fire-and-forget: send shipping notification email after successful update
          if (body.fulfillmentStatus === 'SHIPPED') {
            sendOrderShippedNotification(body.orderId, body.itemId);
          }

          createAuditLog({
            actorId: session.user.id,
            actorRole: session.user.role,
            action: 'ORDER_FULFILLED',
            entity: 'OrderItem',
            entityId: body.itemId,
            details: {
              orderId: body.orderId,
              newStatus: body.fulfillmentStatus,
              trackingNumber: body.trackingNumber,
            },
          }).catch(() => {});

          return Response.json(
            {
              id: updated.id,
              fulfillmentStatus: updated.fulfillmentStatus,
              trackingNumber: updated.trackingNumber,
              trackingUrl: updated.trackingUrl,
              shippedAt: updated.shippedAt?.toISOString() ?? null,
              deliveredAt: updated.deliveredAt?.toISOString() ?? null,
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
