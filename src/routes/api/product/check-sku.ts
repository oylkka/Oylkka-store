import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/product/check-sku')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const url = new URL(request.url);
          const sku = url.searchParams.get('sku');
          const productId = url.searchParams.get('productId');

          if (!sku) {
            return Response.json({
              available: false,
              error: 'SKU is required',
            });
          }

          const existing = await prisma.product.findFirst({
            where: {
              sku,
              ...(productId ? { NOT: { id: productId } } : {}),
            },
            select: { id: true },
          });

          return Response.json({ available: !existing });
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
