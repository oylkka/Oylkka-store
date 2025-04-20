import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { ProductStatus } from '@/prisma/output';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || '';
    const limit = Number(searchParams.get('limit')) || 5;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get the current product to find related ones
    const currentProduct = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        productName: true,
        category: true,
        subcategory: true,
        tags: true,
        brand: true,
        price: true,
        condition: true,
        attributes: true,
      },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate a score for each potential related product
    const relatedProducts = await db.product.findMany({
      where: {
        id: { not: productId }, // Exclude the current product
        // TODO: Replace DRAFT with PUBLISHED
        status: ProductStatus.DRAFT, // Only include published products
        stock: { gt: 0 }, // Only include in-stock products
      },
      take: limit * 3, // Fetch more than needed to allow for scoring
      select: {
        id: true,
        productName: true,
        description: true,
        category: true,
        subcategory: true,
        tags: true,
        sku: true,
        price: true,
        discountPrice: true,
        discountPercent: true,
        brand: true,
        condition: true,
        attributes: true,
        images: {
          select: {
            url: true,
          },
        },
        freeShipping: true,
        stock: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Score each product based on similarity to the current product
    const scoredProducts = relatedProducts.map((product) => {
      let score = 0;

      // Category match (highest importance)
      if (product.category === currentProduct.category) {
        score += 100;
        // Subcategory match (even higher importance)
        if (product.subcategory === currentProduct.subcategory) {
          score += 50;
        }
      }

      // Brand match (important for brand loyalty)
      if (product.brand && product.brand === currentProduct.brand) {
        score += 40;
      }

      // Condition match (similar quality level preference)
      if (product.condition === currentProduct.condition) {
        score += 20;
      }

      // Price similarity (customers often look in similar price ranges)
      const productPrice = product.discountPrice || product.price;
      const currentPrice = currentProduct.price;
      const priceRatio =
        Math.min(productPrice, currentPrice) /
        Math.max(productPrice, currentPrice);

      // If price is within 20% range, consider it similar
      if (priceRatio > 0.8) {
        score += 30;
      } else if (priceRatio > 0.6) {
        score += 15;
      }

      // Tag matches (common interests/features)
      const tagMatches =
        product.tags?.filter((tag) => currentProduct.tags?.includes(tag))
          .length || 0;

      score += tagMatches * 10;

      // Attribute similarity (product specs)
      if (product.attributes && currentProduct.attributes) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productAttrs = product.attributes as Record<string, any>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const currentAttrs = currentProduct.attributes as Record<string, any>;

          // Count matching attribute keys and values
          const attrKeys = Object.keys(productAttrs);
          for (const key of attrKeys) {
            if (currentAttrs[key] === productAttrs[key]) {
              score += 5; // Same attribute values
            } else if (key in currentAttrs) {
              score += 2; // Same attribute key but different value
            }
          }
        } catch (e) {
          // Handle if attributes isn't a proper JSON object
          console.warn('Error processing attributes:', e);
        }
      }

      // Calculate review metrics
      const reviewCount = product.reviews.length;
      const averageRating =
        reviewCount > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviewCount
          : 0;

      return {
        ...product,
        score,
        imageUrl: product.images[0]?.url || null,
        reviewCount,
        rating: parseFloat(averageRating.toFixed(1)),
      };
    });

    // Sort by score and take the requested number
    const sortedProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Clean up response by removing score and restructuring
    const responseProducts = sortedProducts.map(({ ...product }) => ({
      ...product,
    }));

    // If we have very few products, fallback to recent products from same category
    if (responseProducts.length < 2) {
      const fallbackProducts = await db.product.findMany({
        where: {
          id: { not: productId },
          // TODO: Replace DRAFT with PUBLISHED
          status: ProductStatus.DRAFT,
          stock: { gt: 0 },
          category: currentProduct.category,
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          productName: true,
          description: true,
          price: true,
          discountPrice: true,
          discountPercent: true,
          category: true,
          subcategory: true,
          brand: true,
          condition: true,
          tags: true,
          sku: true,
          stock: true,
          freeShipping: true,
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
      });

      // Process fallback products to add review count and rating
      const formattedFallbacks = fallbackProducts.map((product) => {
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
          images: undefined,
          reviews: undefined,
        };
      });

      return NextResponse.json({ products: formattedFallbacks });
    }

    return NextResponse.json({ products: responseProducts });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
