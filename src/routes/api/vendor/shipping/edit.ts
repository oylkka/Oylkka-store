import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vendor/shipping/edit')({
  server: {
    handlers: {
      PUT: async ({ request }) => {
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

          const body = await request.json();
          const {
            id,
            name,
            districts,
            baseCost,
            perItem,
            freeAbove,
            estDays,
            isActive,
          } = body;

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

          const zone = await prisma.shippingZone.update({
            where: { id },
            data: {
              ...(typeof name === 'string' && { name }),
              ...(typeof baseCost === 'number' && { baseCost }),
              ...(typeof perItem === 'number' && { perItem }),
              ...(typeof freeAbove === 'number' && { freeAbove }),
              ...(freeAbove === null && { freeAbove: null }),
              ...(typeof estDays === 'string' && { estDays }),
              ...(estDays === null && { estDays: null }),
              ...(typeof isActive === 'boolean' && { isActive }),
              ...(Array.isArray(districts) && {
                districts: {
                  deleteMany: {},
                  create: districts.map((d: string) => ({ district: d })),
                },
              }),
            },
            include: { districts: { select: { district: true } } },
          });

          return Response.json({
            zone: {
              ...zone,
              districts: zone.districts.map((d) => d.district),
            },
          });
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
