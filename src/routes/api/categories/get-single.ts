import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/categories/get-single')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { id } = (await request.json()) as { id: string };

          if (!id) {
            return Response.json(
              { error: 'Category ID is required' },
              { status: 400 },
            );
          }

          const category = await prisma.category.findUnique({
            where: { id },
            include: { parent: true },
          });

          if (!category) {
            return Response.json(
              { error: 'Category not found' },
              { status: 404 },
            );
          }

          return Response.json(category, { status: 200 });
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
