import { db } from '@/lib/db';
import { ProductStatus } from '@/prisma/output';
import { NextRequest, NextResponse } from 'next/server';

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
        // TODO: Remove draft products
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
        images: true,
        freeShipping: true,
      },
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
      const priceDifference = Math.abs(productPrice - currentPrice);
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
      const tagMatches = product.tags.filter((tag) =>
        currentProduct.tags.includes(tag)
      ).length;

      score += tagMatches * 10;

      // Attribute similarity (product specs)
      if (product.attributes && currentProduct.attributes) {
        try {
          const productAttrs = product.attributes as Record<string, any>;
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

      return {
        ...product,
        score,
        imageUrl: product.images[0]?.url || null,
      };
    });

    // Sort by score and take the requested number
    const sortedProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Clean up response by removing score and restructuring
    const responseProducts = sortedProducts.map(
      ({ score, images, ...product }) => ({
        ...product,
        imageUrl: product.imageUrl,
      })
    );

    // If we have very few products, fallback to recent products from same category
    if (responseProducts.length < 2) {
      const fallbackProducts = await db.product.findMany({
        where: {
          id: { not: productId },
          status: ProductStatus.PUBLISHED,
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
          category: true,
          subcategory: true,
          brand: true,
          condition: true,
          tags: true,
          images: true,
        },
      });

      const formattedFallback = fallbackProducts.map((product) => ({
        ...product,
        imageUrl: product.images[0]?.url || null,
        images: undefined,
      }));

      return NextResponse.json({ products: formattedFallback });
    }

    return NextResponse.json({
      products: responseProducts,
      recommendationCriteria: {
        category: currentProduct.category,
        subcategory: currentProduct.subcategory,
        matchedTags: currentProduct.tags.length > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
