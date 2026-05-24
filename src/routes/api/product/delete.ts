import { createFileRoute } from '@tanstack/react-router';
import { DeleteImage } from '@/cloudinary';
import { requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/product/delete')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const session = authResult.session;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const { id } = await request.json();

          if (!id) {
            return Response.json(
              { error: 'Product ID is required' },
              { status: 400 },
            );
          }

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true },
          });

          if (!product) {
            return Response.json(
              { error: 'Product not found' },
              { status: 404 },
            );
          }

          const isAdmin =
            session.user.role === 'ADMIN' || session.user.role === 'MANAGER';
          const isOwner = shop && product.shopId === shop.id;

          if (!isAdmin && !isOwner) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
          }

          for (const img of product.images) {
            if (img.imagePublicId) {
              await DeleteImage(img.imagePublicId).catch(() => {});
            }
          }

          await prisma.product.delete({ where: { id } });

          return Response.json(
            { message: 'Product deleted successfully' },
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
