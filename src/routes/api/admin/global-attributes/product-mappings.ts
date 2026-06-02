import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrManager, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute(
  '/api/admin/global-attributes/product-mappings',
)({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdminOrManager(authResult.session);
          if (roleResponse) return roleResponse;

          const url = new URL(request.url);
          const productId = url.searchParams.get('productId');

          if (!productId) {
            return Response.json(
              { error: 'productId query parameter is required' },
              { status: 400 },
            );
          }

          const mappings = await prisma.productGlobalAttributeValue.findMany({
            where: { productId },
            include: {
              globalAttribute: {
                select: { id: true, name: true, slug: true },
              },
              globalValue: {
                select: { id: true, value: true, slug: true, metadata: true },
              },
            },
          });

          // Also fetch the product's local attribute values to show what can be mapped
          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
              id: true,
              productName: true,
              attributeOptions: {
                select: {
                  id: true,
                  name: true,
                  attributeValues: {
                    select: {
                      id: true,
                      value: true,
                      slug: true,
                    },
                    orderBy: { displayOrder: 'asc' },
                  },
                },
                orderBy: { displayOrder: 'asc' },
              },
            },
          });

          return Response.json({
            mappings,
            product,
          });
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
