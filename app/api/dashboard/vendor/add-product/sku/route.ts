import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sku, productId } = await request.json();

    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 });
    }

    // Check if SKU exists in database, excluding the current product if provided
    const existingSku = await db.product.findFirst({
      where: {
        sku,
        ...(productId ? { id: { not: productId } } : {}),
      },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingSku,
      message: existingSku ? 'SKU already exists' : 'SKU is available',
    });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check SKU' }, { status: 500 });
  }
}
