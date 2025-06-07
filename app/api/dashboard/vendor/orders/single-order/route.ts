import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || '';

    const shop = await db.shop.findUnique({
      where: { ownerId: session.user.id },
      select: {
        id: true,
      },
    });
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const order = await db.order.findUnique({
      where: { orderNumber: orderId },
      include: {
        items: {
          where: { shopId: shop.id },
        },
      },
    });

    return NextResponse.json({ order }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
