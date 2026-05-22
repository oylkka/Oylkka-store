import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/product/report/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }
          const body = await request.json();
          const { productId, reason, details } = body;
          if (!productId || !reason) {
            return Response.json(
              { error: 'productId and reason required' },
              { status: 400 },
            );
          }
          const product = await prisma.product.findUnique({
            where: { id: productId },
          });
          if (!product) {
            return Response.json(
              { error: 'Product not found' },
              { status: 404 },
            );
          }
          const report = await prisma.productReport.create({
            data: {
              productId,
              userId: session.user.id,
              reason,
              details: details || null,
            },
          });
          return Response.json({ report }, { status: 201 });
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
