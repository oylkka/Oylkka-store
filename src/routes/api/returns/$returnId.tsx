import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/returns/$returnId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const returnRequest = await prisma.returnRequest.findUnique({
            where: { id: params.returnId },
            include: {
              order: {
                select: {
                  orderNumber: true,
                  items: {
                    where: { fulfillmentStatus: 'DELIVERED' },
                    select: {
                      id: true,
                      productName: true,
                      imageUrl: true,
                      quantity: true,
                      unitPrice: true,
                    },
                  },
                },
              },
            },
          });

          if (!returnRequest || returnRequest.customerId !== session.user.id) {
            return Response.json(
              { error: 'Return request not found' },
              { status: 404 },
            );
          }

          return Response.json({ return: returnRequest });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to fetch return request',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
