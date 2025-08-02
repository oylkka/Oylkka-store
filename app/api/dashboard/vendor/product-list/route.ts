import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedUser(req);

    if (!session) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }
    if (session.role !== 'VENDOR') {
      return NextResponse.json('Unauthorized', { status: 401 });
    }
    const { searchParams } = new URL(req.url);

    // Extract all parameters
    const page = parseInt(searchParams.get('currentPage') || '1');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const minPrice = searchParams.get('minPrice')
      ? // biome-ignore lint: error
        parseFloat(searchParams.get('minPrice')!)
      : null;
    const maxPrice = searchParams.get('maxPrice')
      ? // biome-ignore lint: error
        parseFloat(searchParams.get('maxPrice')!)
      : null;
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];

    const limit = 16;

    // Build the where clause for filtering
    // biome-ignore lint: error
    const whereClause: any = {};
    whereClause.shop = {
      ownerId: session.id,
    };
    // Add search functionality
    if (search?.trim()) {
      const searchTerm = search.trim();
      whereClause.OR = [
        {
          productName: {
            contains: searchTerm,
            mode: 'insensitive',
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

    // Build the orderBy clause
    // biome-ignore lint: error
    let orderBy: any = { createdAt: 'desc' };

    switch (sortBy) {
      case 'popular':
        orderBy = [{ reviews: { _count: 'desc' } }, { createdAt: 'desc' }];
        break;
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'old':
        orderBy = { createdAt: 'asc' };
        break;
      case 'priceLow':
        orderBy = { price: 'asc' };
        break;
      case 'priceHigh':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get current authenticated user
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || null;

    // Fetch user's wishlist product IDs (if logged in)
    let wishlistProductIds: string[] = [];

    if (userId) {
      const wishlistItems = await db.wishlistItem.findMany({
        where: { userId },
        select: { productId: true },
      });

      wishlistProductIds = wishlistItems.map((item) => item.productId);
    }

    // Get total count
    const totalProducts = await db.product.count({
      where: whereClause,
    });

    // Get paginated products
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
      orderBy,
    });

    // Map products to include rating, review count, and isWishlisted
    const productWithRatings = products.map((product) => {
      const reviewCount = product.reviews.length;
      const averageRating =
        reviewCount > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;

      return {
        ...product,
        imageUrl: product.images[0]?.url || null,
        reviewCount,
        rating: parseFloat(averageRating.toFixed(1)),
        isWishlisted: wishlistProductIds.includes(product.id), // ✅ added
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
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
