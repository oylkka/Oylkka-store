import { type NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || null;

    let wishlistProductIds: string[] = [];

    if (userId) {
      const wishlistItems = await db.wishlistItem.findMany({
        where: { userId },
        select: { productId: true },
      });

      wishlistProductIds = wishlistItems.map((item) => item.productId);
    }

    const products = await db.product.findMany({
      where: {
        featured: true,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    });

    const productWithRatings = products.map((product) => {
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
        isWishlisted: wishlistProductIds.includes(product.id),
      };
    });

    if (!products) {
      return new Response('Not Found', { status: 404 });
    }

    return NextResponse.json({
      products: productWithRatings,
    });
    // biome-ignore lint: error
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
