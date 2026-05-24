import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vendor/shop/policies')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
            select: { policies: true },
          });

          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          return Response.json({ policies: shop.policies });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
          );
        }
      },

      PUT: async ({ request }) => {
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
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          const body = await request.json();
          const { shippingPolicy, returnPolicy, termsAndConditions } = body;

          const policies: Record<string, string> = {};
          if (shippingPolicy !== undefined) policies.shippingPolicy = shippingPolicy;
          if (returnPolicy !== undefined) policies.returnPolicy = returnPolicy;
          if (termsAndConditions !== undefined) policies.termsAndConditions = termsAndConditions;

          const updated = await prisma.shop.update({
            where: { id: shop.id },
            data: { policies },
          });

          return Response.json({ policies: updated.policies });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
          );
        }
      },
    },
  },
});
