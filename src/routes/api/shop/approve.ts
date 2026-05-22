import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { createAuditLog } from '@/lib/audit-log';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/shop/approve')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const { id } = (await request.json()) as { id: string };

          if (!id) {
            return Response.json(
              { error: 'Shop ID is required' },
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

          if (shop.ownerId === session.user.id) {
            return Response.json(
              { error: 'Cannot approve your own shop' },
              { status: 400 },
            );
          }

          const [updated] = await prisma.$transaction(async (tx) => {
            const updatedShop = await tx.shop.update({
              where: { id },
              data: {
                status: 'ACTIVE',
                approvedAt: new Date(),
                approvedBy: session.user.id,
              },
            });

            const owner = await tx.user.findUnique({
              where: { id: shop.ownerId },
            });

            if (owner && owner.role !== 'ADMIN' && owner.role !== 'MANAGER') {
              await tx.user.update({
                where: { id: shop.ownerId },
                data: { role: 'VENDOR' },
              });
            }

            return [updatedShop];
          });

          createAuditLog({
            actorId: session.user.id,
            actorRole: session.user.role,
            action: 'SHOP_APPROVED',
            entity: 'Shop',
            entityId: id,
            details: { shopName: shop.name, ownerId: shop.ownerId },
          }).catch(() => {});

          return Response.json(
            { message: 'Shop approved successfully', shop: updated },
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
