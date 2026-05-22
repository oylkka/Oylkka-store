import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/returns/list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const returns = await prisma.returnRequest.findMany({
            where: { customerId: session.user.id },
            include: {
              order: {
                select: { orderNumber: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          return Response.json({ returns });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to list return requests',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
