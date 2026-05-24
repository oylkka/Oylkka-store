import { createFileRoute } from '@tanstack/react-router';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { payoutProcessedHtml } from '@/lib/email-templates';
import { sendEmail } from '@/lib/send-email';

export const Route = createFileRoute('/api/admin/payouts/process')({
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
          const { shopId, note } = body;

          if (!shopId) {
            return Response.json(
              { error: 'shopId is required' },
              { status: 400 },
            );
          }

          const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            include: {
              owner: { select: { email: true, name: true } },
            },
          });
          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          const items = await prisma.orderItem.findMany({
            where: {
              shopId,
              fulfillmentStatus: 'DELIVERED',
              payoutItem: null,
            },
          });

          if (items.length === 0) {
            return Response.json(
              { error: 'No pending items for this shop' },
              { status: 400 },
            );
          }

          const totalAmount = items.reduce(
            (sum, item) => sum + Number(item.vendorAmount),
            0,
          );

          const payout = await prisma.$transaction(async (tx) => {
            const created = await tx.payout.create({
              data: {
                shopId,
                amount: totalAmount,
                currency: 'BDT',
                status: 'COMPLETED',
                note: note || null,
                processedBy: session.user.id,
                processedAt: new Date(),
                items: {
                  create: items.map((item) => ({
                    orderItemId: item.id,
                    amount: Number(item.vendorAmount),
                    commission: Number(item.commissionAmount),
                  })),
                },
              },
            });

            return created;
          });

          const full = await prisma.payout.findUnique({
            where: { id: payout.id },
            include: {
              shop: { select: { id: true, name: true } },
              _count: { select: { items: true } },
            },
          });

          sendEmail({
            to: shop.owner.email,
            subject: 'Payout processed',
            meta: {
              description: '',
              link: '',
              callToActionText: '',
            },
            html: payoutProcessedHtml(
              shop.name,
              totalAmount,
              items.length,
              note || null,
            ),
          });

          return Response.json({ payout: full }, { status: 201 });
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
