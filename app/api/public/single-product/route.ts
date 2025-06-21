import { NextRequest, NextResponse } from 'next/server';

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
          rating: Number(averageRating.toFixed(1)), // Optional: round to 1 decimal
          reviewCount,
        },
      },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
