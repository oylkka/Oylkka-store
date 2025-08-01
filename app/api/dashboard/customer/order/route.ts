import { type NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Always fetch all orders - filtering will be done on frontend
    const orders = await db.order.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        total: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(orders, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
