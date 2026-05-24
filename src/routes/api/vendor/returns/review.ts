import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { generalLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

export const Route = createFileRoute('/api/vendor/returns/review')({
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

          const rateLimitResponse = await checkRateLimit(generalLimiter);
          if (rateLimitResponse) return rateLimitResponse;

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop) {
            return Response.json({ error: 'No shop found' }, { status: 404 });
          }

          const body = await request.json();
          const { returnId, status: newStatus, adminNote } = body;

          if (!returnId || !newStatus) {
            return Response.json(
              { error: 'returnId and status are required' },
              { status: 400 },
            );
          }

          const VALID_STATUSES = ['APPROVED', 'REJECTED'];
          if (!VALID_STATUSES.includes(newStatus)) {
            return Response.json({ error: 'Invalid status' }, { status: 400 });
          }

          const returnRequest = await prisma.returnRequest.findFirst({
            where: { id: returnId, shopId: shop.id },
          });

          if (!returnRequest) {
            return Response.json(
              { error: 'Return request not found' },
              { status: 404 },
            );
          }

          if (returnRequest.status !== 'PENDING') {
            return Response.json(
              { error: 'Return request has already been reviewed' },
              { status: 400 },
            );
          }

          const updated = await prisma.returnRequest.update({
            where: { id: returnId },
            data: {
              status: newStatus as never,
              adminNote: adminNote ?? null,
              reviewedBy: session.user.id,
              reviewedAt: new Date(),
            },
          });

          return Response.json({ return: updated });
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
