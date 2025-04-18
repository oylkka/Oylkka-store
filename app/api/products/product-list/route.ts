import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const totalProducts = await db.product.count();

    const products = await db.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        productName: true,
        price: true,
        discountPrice: true,
        stock: true,
        status: true,
        category: true,
        subcategory: true,
        discountPercent: true,

        images: {
          select: {
            url: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      products,
      pagination: {
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
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
