import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/shop/public-products')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const shopSlug = url.searchParams.get('shopSlug');
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            50,
            Math.max(1, Number(url.searchParams.get('limit')) || 20),
          );

          if (!shopSlug) {
            return Response.json(
              { error: 'shopSlug is required' },
              { status: 400 },
            );
          }

          const shop = await prisma.shop.findUnique({
            where: { slug: shopSlug, status: 'ACTIVE' },
            select: { id: true },
          });

          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          const where = {
            shopId: shop.id,
            status: 'PUBLISHED' as const,
          };

          const [products, total] = await Promise.all([
            prisma.product.findMany({
              where,
              select: {
                id: true,
                productName: true,
                slug: true,
                price: true,
                discountPrice: true,
                stock: true,
                hasVariants: true,
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                  select: { imageUrl: true },
                },
                category: {
                  select: { id: true, name: true, slug: true },
                },
                shop: {
                  select: { id: true, name: true, slug: true },
                },
                _count: { select: { reviews: true } },
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              skip: (page - 1) * limit,
              take: limit,
            }),
            prisma.product.count({ where }),
          ]);

          return Response.json(
            {
              products,
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
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
