import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/shop/admin-list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (
            !session?.user ||
            (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')
          ) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          const search = url.searchParams.get('search');

          const where: Record<string, unknown> = {};

          if (status && ['PENDING', 'ACTIVE', 'REJECTED'].includes(status)) {
            where.status = status;
          }

          if (search) {
            where.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              {
                owner: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            ];
          }

          const shops = await prisma.shop.findMany({
            where,
            include: {
              owner: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          return Response.json(shops, { status: 200 });
        } catch {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
