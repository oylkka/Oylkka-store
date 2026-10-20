import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { ProductModerationSchema } from '@/schemas/product-api-schema';

/**
 * Admin moderation of a single listing: pull it (`REJECTED`) or put it back
 * (`PUBLISHED`).
 *
 * Rejecting is not part of the edit form because the form is shared with
 * vendors and `ProductStatusEnum` — what a vendor may submit — deliberately
 * has no `REJECTED` value. Keeping the outcome on its own staff-only endpoint
 * means the vendor's own save can never fabricate or clear a moderation
 * decision.
 */
export const Route = createFileRoute('/api/product/moderate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const session = authResult.session;

          const forbidden = requireAdminOrManager(session);
          if (forbidden) return forbidden;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body = await request.json().catch(() => null);
          if (!body) {
            return Response.json(
              { error: 'Invalid JSON body' },
              { status: 400 },
            );
          }

          const parsed = ProductModerationSchema.safeParse(body);
          if (!parsed.success) {
            return Response.json(
              {
                error: 'Validation failed',
                details: parsed.error.flatten(),
              },
              { status: 400 },
            );
          }
          const { id, status, reason } = parsed.data;

          const product = await prisma.product.findUnique({
            where: { id },
            select: { id: true },
          });

          if (!product) {
            return Response.json(
              { error: 'Product not found' },
              { status: 404 },
            );
          }

          const updated = await prisma.product.update({
            where: { id },
            data: {
              status,
              // The reason describes the current rejection and nothing else,
              // so restoring a listing clears it rather than leaving a stale
              // note on a live product.
              rejectionReason: status === 'REJECTED' ? (reason ?? null) : null,
            },
            select: {
              id: true,
              productName: true,
              status: true,
              rejectionReason: true,
            },
          });

          return Response.json(
            {
              message:
                status === 'REJECTED'
                  ? 'Product rejected'
                  : 'Product published',
              product: updated,
            },
            { status: 200 },
          );
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
