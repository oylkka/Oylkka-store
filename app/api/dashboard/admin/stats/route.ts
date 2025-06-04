import { NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (
      !session ||
      !session.user ||
      !session.user.role ||
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }
    const [
      productCount,
      orderCount,
      userCount,
      shopCount,
      reviewStats,
      recentOrders,
      recentProducts,
      recentReviews,
      recentUsers,
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.user.count(),
      db.shop.count(),
      db.review.aggregate({
        _count: true,
        _avg: { rating: true },
      }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          user: { select: { name: true } },
        },
      }),
      db.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          slug: true,
          productName: true,
          user: { select: { name: true } },
        },
      }),
      db.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          rating: true,
          content: true,
          user: { select: { name: true, image: true } },
          product: { select: { productName: true, slug: true } },
        },
      }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          username: true,
          name: true,
          email: true,
          role: true,
        },
      }),
    ]);

    // Add activity type for later display context
    const taggedOrders = recentOrders.map((item) => ({
      ...item,
      type: 'ORDER',
    }));
    const taggedProducts = recentProducts.map((item) => ({
      ...item,
      type: 'PRODUCT',
    }));
    const taggedReviews = recentReviews.map((item) => ({
      ...item,
      type: 'REVIEW',
    }));
    const taggedUsers = recentUsers.map((item) => ({ ...item, type: 'USER' }));

    // Merge and sort by createdAt
    const recentActivity = [
      ...taggedOrders,
      ...taggedProducts,
      ...taggedReviews,
      ...taggedUsers,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        orders: orderCount,
        products: productCount,
        shops: shopCount,
        users: userCount,
        reviews: {
          count: reviewStats._count,
          averageRating: Number((reviewStats._avg.rating || 0).toFixed(1)),
        },
      },
      recentOrders,
      recentActivity,
      recentReviews,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
