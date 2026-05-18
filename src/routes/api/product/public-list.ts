import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/product/public-list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const sort = url.searchParams.get('sort') || 'newest';
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            50,
            Math.max(1, Number(url.searchParams.get('limit')) || 20),
          );
          const categorySlug = url.searchParams.get('category') || undefined;

          let categoryId: string | undefined;
          if (categorySlug) {
            const category = await prisma.category.findUnique({
              where: { slug: categorySlug },
              select: { id: true },
            });
            if (category) categoryId = category.id;
          }

          const orderBy:
            | { createdAt: 'desc' }
            | { price: 'asc' }
            | { price: 'desc' } =
            sort === 'price_asc'
              ? { price: 'asc' }
              : sort === 'price_desc'
                ? { price: 'desc' }
                : { createdAt: 'desc' };

          const where = {
            status: 'PUBLISHED' as const,
            ...(categoryId ? { categoryId } : {}),
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
              orderBy,
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
