import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sku } = await request.json();

    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 });
    }

    // Check if SKU exists in database
    const existingSku = await db.product.findUnique({
      where: { sku },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingSku,
      message: existingSku ? 'SKU already exists' : 'SKU is available',
    });
  } catch (error) {
    console.error('Error checking SKU:', error);
    return NextResponse.json({ error: 'Failed to check SKU' }, { status: 500 });
  }
}
