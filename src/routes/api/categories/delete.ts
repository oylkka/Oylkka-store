import { createFileRoute } from '@tanstack/react-router';
import { DeleteImage } from '@/cloudinary';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/categories/delete')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdmin(authResult.session);
          if (roleResponse) return roleResponse;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

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
