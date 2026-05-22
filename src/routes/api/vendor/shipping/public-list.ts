import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vendor/shipping/public-list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const shopId = url.searchParams.get('shopId');
          const district = url.searchParams.get('district');

          if (!shopId || !district) {
            return Response.json(
              { error: 'shopId and district are required' },
              { status: 400 },
            );
          }

          const zone = await prisma.shippingZone.findFirst({
            where: {
              shopId,
              isActive: true,
              districts: { has: district },
            },
          });

          return Response.json({ zone });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to lookup shipping zone',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
