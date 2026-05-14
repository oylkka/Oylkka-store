import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { DeleteImage } from '@/cloudinary';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/categories/delete')({
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
            include: { children: true, products: true },
          });

          if (!category) {
            return Response.json(
              { error: 'Category not found' },
              { status: 404 },
            );
          }

          if (category.children.length > 0) {
            return Response.json(
              {
                error:
                  'Cannot delete category with subcategories. Remove or reassign subcategories first.',
              },
              { status: 400 },
            );
          }

          if (category.products.length > 0) {
            return Response.json(
              {
                error:
                  'Cannot delete category with associated products. Reassign products first.',
              },
              { status: 400 },
            );
          }

          if (category.imagePublicId) {
            await DeleteImage(category.imagePublicId);
          }

          await prisma.category.delete({ where: { id } });

          return Response.json({ success: true }, { status: 200 });
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
