import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vendor/shipping/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop) {
            return Response.json({ error: 'No shop found' }, { status: 404 });
          }

          const body = await request.json();
          const { name, districts, baseCost, perItem, freeAbove, estDays } =
            body;

          if (!name || typeof name !== 'string') {
            return Response.json(
              { error: 'Name is required' },
              { status: 400 },
            );
          }

          if (!Array.isArray(districts) || districts.length === 0) {
            return Response.json(
              { error: 'At least one district is required' },
              { status: 400 },
            );
          }

          if (typeof baseCost !== 'number' || baseCost < 0) {
            return Response.json(
              { error: 'Base cost must be a non-negative number' },
              { status: 400 },
            );
          }

          const zone = await prisma.shippingZone.create({
            data: {
              shopId: shop.id,
              name,
              districts,
              baseCost,
              perItem: typeof perItem === 'number' ? perItem : 0,
              freeAbove: typeof freeAbove === 'number' ? freeAbove : null,
              estDays: typeof estDays === 'string' ? estDays : null,
            },
          });

          return Response.json({ zone }, { status: 201 });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to create shipping zone',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
