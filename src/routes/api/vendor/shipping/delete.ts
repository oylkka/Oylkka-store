import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vendor/shipping/delete')({
  server: {
    handlers: {
      DELETE: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop) {
            return Response.json({ error: 'No shop found' }, { status: 404 });
          }

          const url = new URL(request.url);
          const id = url.searchParams.get('id');

          if (!id) {
            return Response.json(
              { error: 'Zone ID is required' },
              { status: 400 },
            );
          }

          const existing = await prisma.shippingZone.findFirst({
            where: { id, shopId: shop.id },
          });

          if (!existing) {
            return Response.json(
              { error: 'Shipping zone not found' },
              { status: 404 },
            );
          }

          await prisma.shippingZone.delete({ where: { id } });

          return Response.json({ message: 'Shipping zone deleted' });
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
