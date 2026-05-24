import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { reviewLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

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
          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;
          const rateLimitResponse = await checkRateLimit(reviewLimiter);
          if (rateLimitResponse) return rateLimitResponse;
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
