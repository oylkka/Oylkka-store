import { type NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || '';

    const product = await db.product.findUnique({
      where: { slug },
      include: {
        shop: {
          select: {
            name: true,
            slug: true,
            ownerId: true,
            logo: {
              select: { url: true },
            },
            bannerImage: {
              select: { url: true },
            },
            isVerified: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const user = await getAuthenticatedUser(req);
    let isWishlisted = false;

    if (user) {
      const wishlistItem = await db.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
      });
      isWishlisted = !!wishlistItem;
    }

    const reviewCount = product.reviews.length;
    const averageRating =
      reviewCount > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviewCount
        : 0;

    return NextResponse.json(
      {
        product: {
          ...product,
          rating: Number(averageRating.toFixed(1)),
          reviewCount,
          isWishlisted,
        },
      },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
