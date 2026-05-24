import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generalLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

export const Route = createFileRoute('/api/wallet/get')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const rateLimitResponse = await checkRateLimit(generalLimiter);
          if (rateLimitResponse) return rateLimitResponse;

          let wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
            include: {
              transactions: {
                orderBy: { createdAt: 'desc' },
                take: 50,
              },
            },
          });

          if (!wallet) {
            wallet = await prisma.wallet.create({
              data: { userId: session.user.id },
              include: {
                transactions: { take: 50, orderBy: { createdAt: 'desc' } },
              },
            });
          }

          return Response.json(wallet, { status: 200 });
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
