import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract all parameters
    const page = parseInt(searchParams.get('currentPage') || '1');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : null;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : null;
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];

    const limit = 16;

    // Build the where clause for filtering
    //  eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    // Add search functionality
    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereClause.OR = [
        {
          productName: {
            contains: searchTerm,
            mode: 'insensitive', // Case-insensitive search
          },
        },
        {
          category: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      whereClause.category = {
        name: {
          equals: category,
          mode: 'insensitive',
        },
      };
    }

    // Price range filter
    if (minPrice !== null || maxPrice !== null) {
      whereClause.price = {};

      if (minPrice !== null && minPrice > 0) {
        whereClause.price.gte = minPrice;
      }

      if (maxPrice !== null && maxPrice > 0) {
        whereClause.price.lte = maxPrice;
      }
    }

    // Build the orderBy clause based on sortBy parameter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' }; // default

    switch (sortBy) {
      case 'popular':
        // Sort by review count or total sales (you might need to add this logic)
        orderBy = [
          { reviews: { _count: 'desc' } }, // More reviews = more popular
          { createdAt: 'desc' },
        ];
        break;
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'old':
        orderBy = { createdAt: 'asc' };
      case 'priceLow':
        orderBy = { price: 'asc' };
        break;
      case 'priceHigh':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get the total count of products with all filters
    const totalProducts = await db.product.count({
      where: whereClause,
    });

    // Get the products along with review count and average rating
    const products = await db.product.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
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
      orderBy: orderBy,
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
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        hasNext: page < Math.ceil(totalProducts / limit),
        hasPrev: page > 1,
      },
      // Include filter info in response for debugging/logging
      filterInfo: {
        search: search || null,
        category: category || null,
        sortBy: sortBy || null,
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
        sizes: sizes.length > 0 ? sizes : null,
        colors: colors.length > 0 ? colors : null,
        resultsCount: totalProducts,
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
