import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || '';

    const shop = await db.shop.findUnique({
      where: { slug },
      include: {
        products: {
          select: {
            id: true,
            productName: true,
            price: true,
            discountPrice: true,
            slug: true,
            stock: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
            freeShipping: true,
            discountPercent: true,
            updatedAt: true,
            images: {
              select: {
                url: true,
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Map products to include imageUrl, reviewCount, and rating
    const productsWithRatings = shop.products.map((product) => {
      const reviewCount = product.reviews.length;
      const averageRating =
        reviewCount > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviewCount
          : 0;

      return {
        ...product,
        imageUrl: product.images[0]?.url || null,
        reviewCount,
        rating: parseFloat(averageRating.toFixed(1)),
      };
    });

    return NextResponse.json(
      { shop: { ...shop, products: productsWithRatings } },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
