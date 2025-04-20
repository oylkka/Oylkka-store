import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('currentPage') || '1');
    const limit = 16;

    // Get the total count of products
    const totalProducts = await db.product.count();

    // Get the products along with review count and average rating
    const products = await db.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        productName: true,
        price: true,
        discountPrice: true,
        stock: true,
        category: true,
        subcategory: true,
        freeShipping: true,
        discountPercent: true,
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
      orderBy: { createdAt: 'desc' },
    });

    // Map the products to add review count and average rating
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
      };
    });

    return NextResponse.json({
      products: productWithRatings,
      pagination: {
        totalProducts: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error('Error retrieving products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
