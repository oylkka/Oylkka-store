import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

const allowedOrderStatuses = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];
const allowedPaymentStatuses = ['PENDING', 'PAID', 'FAILED'];

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
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, orderStatus, paymentStatus } = await req.json();

    if (!orderId || (!orderStatus && !paymentStatus)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Validate input
    if (orderStatus && !allowedOrderStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 },
      );
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 },
      );
    }

    const shop = await db.shop.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const vendorOrderItems = await db.orderItem.findMany({
      where: {
        orderId,
        shopId: shop.id,
      },
    });

    if (vendorOrderItems.length === 0) {
      return NextResponse.json(
        { error: 'No order items found for this vendor' },
        { status: 404 },
      );
    }

    // Update order items for this vendor
    if (orderStatus) {
      await db.orderItem.updateMany({
        where: {
          orderId,
          shopId: shop.id,
        },
        data: {
          status: orderStatus,
        },
      });
    }

    // Fetch all orderItems for this order (across all shops)
    const allOrderItems = await db.orderItem.findMany({
      where: { orderId },
      select: { status: true },
    });

    const allSameStatus =
      orderStatus && allOrderItems.every((item) => item.status === orderStatus);

    const orderUpdateData: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    } = {};

    if (allSameStatus) {
      orderUpdateData.status = orderStatus; // <-- IMPORTANT fix here
    }

    if (paymentStatus) {
      orderUpdateData.paymentStatus = paymentStatus;
    }

    if (Object.keys(orderUpdateData).length > 0) {
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: orderUpdateData,
      });

      // Notify customer of order status change
      if (orderStatus) {
        await db.notification.create({
          data: {
            type: 'INFO',
            title: 'Order Status Updated',
            recipientId: updatedOrder.userId,
            message: `Your order ${updatedOrder.orderNumber} has been updated to ${orderStatus}`,
            actionUrl: `/dashboard/customer/orders?orderId=${updatedOrder.orderNumber}`,
          },
        });
        // biome-ignore lint: error
        const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
        const channel = ably.channels.get(`user:${updatedOrder.userId}`);
        await channel.publish('new-notification', {});
      }
    }

    return NextResponse.json(
      { message: 'Order updated successfully' },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
