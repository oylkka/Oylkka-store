import { subHours } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'VENDOR') {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('currentPage') || '1');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const pageSize = 16;

    await db.order.deleteMany({
      where: {
        status: { in: ['PENDING'] },
        paymentStatus: { in: ['PENDING', 'FAILED'] },
        updatedAt: { lt: subHours(new Date(), 12) },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orders = await db.order.findMany({
      where: whereClause,
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        updatedAt: true,
        total: true,
        items: {
          where: {
            
          }
        },

        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    const totalOrder = await db.order.count({ where: whereClause });

    return NextResponse.json(
      {
        orders,
        pagination: {
          totalOrders: totalOrder,
          totalPages: Math.ceil(totalOrder / pageSize),
          currentPage: page,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ORDER_FETCH_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
