import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/vouchers/my')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const now = new Date();

          const vouchers = await prisma.userVoucher.findMany({
            where: {
              userId: session.user.id,
              usedAt: null,
              coupon: {
                isActive: true,
                expiresAt: { gt: now },
              },
            },
            include: {
              coupon: {
                select: {
                  id: true,
                  code: true,
                  description: true,
                  type: true,
                  value: true,
                  maxDiscount: true,
                  minOrderAmount: true,
                  minQuantity: true,
                  freeShipping: true,
                  shippingDiscount: true,
                  scope: true,
                  scopeId: true,
                  autoApply: true,
                  expiresAt: true,
                },
              },
            },
            orderBy: { collectedAt: 'desc' },
          });

          return Response.json({ vouchers }, { status: 200 });
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
