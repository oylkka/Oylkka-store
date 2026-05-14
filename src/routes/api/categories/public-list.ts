import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/categories/public-list')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const categories = await prisma.category.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              imagePublicId: true,
              description: true,
              parentId: true,
              order: true,
            },
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
          });

          return Response.json(categories, { status: 200 });
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
