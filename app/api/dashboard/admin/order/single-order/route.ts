import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || '';
    const orderInfo = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: true,
      },
    });
    if (!orderInfo) {
      return NextResponse.json('Order not found', { status: 404 });
    }
    return NextResponse.json(orderInfo, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
