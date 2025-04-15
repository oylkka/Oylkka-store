import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';

// Zod schema for query validation
const QuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    condition: z.string().optional(),
    sortBy: z
      .enum(['price', 'createdAt', 'productName', 'stock'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    inStock: z.enum(['true', 'false']).optional(),
  })
  .partial();

type QueryParams = z.infer<typeof QuerySchema>;

type ProcessedProduct = Omit<
  Prisma.ProductGetPayload<{
    select: {
      id: true;
      productName: true;
      description: true;
      price: true;
      discountPrice: true;
      stock: true;
      sku: true;
      category: true;
      subcategory: true;
      attributes: true;
      hasVariants: true;
      createdAt: true;
      updatedAt: true;
      _count: {
        select: {
          variants: true;
        };
      };
    };
  }>,
  '_count'
> & {
  variantCount: number;
  imageUrl: string | null;
  imagePublicId: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const validation = QuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      page = 1,
      limit = 10,
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      // condition,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inStock,
    }: QueryParams = validation.data;

    const skip = (page - 1) * limit;

    // Build where clause with type safety
    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          { productName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      //   ...(condition && { condition: condition.toUpperCase() }),
      ...(inStock === 'true' && { stock: { gt: 0 } }),
      ...(inStock === 'false' && { stock: { equals: 0 } }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
      isPublished: true,
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const totalCount = await db.product.count({ where });

    const products = await db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        productName: true,
        description: true,
        price: true,
        discountPrice: true,
        stock: true,
        sku: true,
        category: true,
        subcategory: true,
        attributes: true,
        hasVariants: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            variants: true,
          },
        },
      },
    });

    const processedProducts: ProcessedProduct[] = products.map((product) => {
      const attributes = (product.attributes as Record<string, string>) || {};
      const { imageUrl, imagePublicId, ...restAttrs } = attributes;

      return {
        ...product,
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
        variantCount: product._count.variants,
        attributes: restAttrs,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: processedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
