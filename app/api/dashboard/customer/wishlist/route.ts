import { type NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const wishlistItems = await db.wishlistItem.findMany({
      where: {
        userId: user.id,
      },
      select: {
        product: {
          select: {
            id: true,
            slug: true,
            productName: true,
            stock: true,
            price: true,
            discountPrice: true,
            discountPercent: true,
            freeShipping: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
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

    const formatted = wishlistItems.map((item) => {
      const product = item.product;
      const reviewCount = product.reviews.length;
      const rating =
        reviewCount > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;

      return {
        id: product.id,
        slug: product.slug,
        productName: product.productName,
        stock: product.stock,
        imageUrl: product.images[0]?.url ?? '',
        price: product.price,
        discountPrice: product.discountPrice ?? undefined,
        discountPercent: product.discountPercent,
        category: product.category,
        freeShipping: product.freeShipping,
        rating: parseFloat(rating.toFixed(1)),
        reviewCount,
        isWishlisted: true,
      };
    });

    return NextResponse.json(formatted, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
