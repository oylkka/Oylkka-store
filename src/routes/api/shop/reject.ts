import { createFileRoute } from '@tanstack/react-router';
import { createAuditLog } from '@/lib/audit-log';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { vendorRejectionHtml } from '@/lib/email-templates';
import { sendEmail } from '@/lib/send-email';

export const Route = createFileRoute('/api/shop/reject')({
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

          const { id, rejectionReason } = (await request.json()) as {
            id: string;
            rejectionReason: string;
          };

          if (!id) {
            return Response.json(
              { error: 'Shop ID is required' },
              { status: 400 },
            );
          }

          if (!rejectionReason?.trim()) {
            return Response.json(
              { error: 'Rejection reason is required' },
              { status: 400 },
            );
          }

          const shop = await prisma.shop.findUnique({
            where: { id },
          });

          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          if (shop.status !== 'PENDING') {
            return Response.json(
              { error: 'Shop is not pending' },
              { status: 400 },
            );
          }

          const updated = await prisma.shop.update({
            where: { id },
            data: {
              status: 'REJECTED',
              rejectionReason: rejectionReason.trim(),
            },
          });

          createAuditLog({
            actorId: session.user.id,
            actorRole: session.user.role ?? 'ADMIN',
            action: 'SHOP_REJECTED',
            entity: 'Shop',
            entityId: id,
            details: {
              shopName: shop.name,
              ownerId: shop.ownerId,
              reason: rejectionReason,
            },
          }).catch(() => {});

          prisma.user
            .findUnique({
              where: { id: shop.ownerId },
              select: { email: true, name: true },
            })
            .then((owner) => {
              if (!owner) return;
              sendEmail({
                to: owner.email,
                subject: 'Your shop application was not approved',
                meta: {
                  description: '',
                  link: '',
                  callToActionText: '',
                },
                html: vendorRejectionHtml(
                  owner.name,
                  shop.name,
                  rejectionReason.trim(),
                ),
              });
            });

          return Response.json(
            { message: 'Shop rejected', shop: updated },
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
