import Ably from 'ably';
import { NextResponse } from 'next/server';

import { bkashConfig } from '@/lib/bkash';
import { db } from '@/lib/db';
import type { PaymentData } from '@/lib/types';
import { createPayment } from '@/services/bkash';

export async function handleBkashPayment(
  data: PaymentData,
  userId: string,
  orderNumber: string,
  myUrl: string,
) {
  try {
    // First, get all unique product IDs from the cart
    const productIds = data.cart.map((item) => item.productId);

    // Query database to get products with their shop IDs, SKUs, and images
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        sku: true,
        shopId: true,
        images: true,
        variants: {
          select: {
            id: true,
            image: true,
          },
        },
      },
    });

    // Map products by ID for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    const order = await db.order.create({
      data: {
        orderNumber,
        user: {
          connect: { id: userId },
        },
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'BKASH',
        subtotal: data.pricing.subtotal,
        tax: 0, // Adjust as needed
        shipping: data.pricing.shippingCost,
        discount: data.pricing.discount.amount || 0,
        total: data.pricing.total,
        currency: 'BDT', // Bangladesh Taka
        shippingAddress: {
          name: data.shipping.address.name,
          address:
            `${data.shipping.address.address}, ${data.shipping.address.apartment || ''}`.trim(),
          city: data.shipping.address.city,
          district: data.shipping.address.district,
          postalCode: data.shipping.address.postalCode,
          phone: data.shipping.address.phone,
          email: data.shipping.address.email,
          isDefault: false,
        },
        metadata: {
          paymentPending: true,
          paymentMethod: 'BKASH',
        },
        items: {
          create: data.cart.map((item) => {
            const product = productMap.get(item.productId);
            if (!product) {
              throw new Error(`Product not found: ${item.productId}`);
            }

            const { sku: productSku, shopId, variants, images } = product;

            // 1. Try to find image from variant
            let image = '';
            if (item.variantId) {
              const variant = variants.find((v) => v.id === item.variantId);
              if (variant?.image) {
                image = variant.image.url;
              }
            }

            // 2. Fallback to first product image
            if (!image && images.length > 0) {
              image = images[0].url;
            }

            return {
              productSku,
              productName: item.name,
              quantity: item.quantity,
              price: item.price,
              discount: item.discountPrice
                ? item.price - item.discountPrice
                : 0,
              variantInfo: {
                variantId: item.variantId,
                variantName: item.variantName,
                variantSku: item.variantSku,
              },
              image,
              shopId,
            };
          }),
        },
      },
    });

    const shops = await db.shop.findMany({
      where: {
        id: {
          in: [
            ...new Set(products.map((p) => p.shopId).filter(Boolean)),
          ] as string[],
        },
      },
      select: {
        ownerId: true,
        id: true,
      },
    });

    // Notify each shop owner
    for (const shop of shops) {
      await db.notification.create({
        data: {
          type: 'INFO',
          title: 'New Order',
          recipientId: shop.ownerId,
          message: `You have a new order! Order ID: ${order.orderNumber}`,
          actionUrl: `/dashboard/vendor/orders?orderId=${order.orderNumber}`,
        },
      });
      // biome-ignore lint: error
      const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
      const channel = ably.channels.get(`user:${shop.ownerId}`);
      await channel.publish('new-notification', {});
    }

    const paymentDetails = {
      amount: data.pricing.total,
      callbackURL: `${myUrl}/api/checkout/callback`,
      orderID: orderNumber,
      reference: '1',
      name: data.shipping.address.name,
      email: data.shipping.address.email,
      phone: data.shipping.address.phone,
    };

    const createPaymentResponse = await createPayment(
      bkashConfig,
      paymentDetails,
    );

    if (createPaymentResponse.statusCode !== '0000') {
      // Update order status to FAILED
      await db.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: 'FAILED',
          metadata: {
            // biome-ignore lint: error
            ...(order.metadata as Record<string, any>),
            paymentError: createPaymentResponse,
          },
        },
      });

      return NextResponse.json({
        message: 'Payment Failed',
        error: createPaymentResponse.statusMessage,
        paymentMethod: 'BKASH',
      });
    }

    // Update order with payment initiation details
    // biome-ignore lint: error
    const currentMetadata = (order.metadata as Record<string, any>) || {};
    await db.order.update({
      where: { orderNumber },
      data: {
        metadata: {
          ...currentMetadata,
          paymentInitiated: true,
          initiatedAt: new Date().toISOString(),
          bkashPaymentID: createPaymentResponse.paymentID,
        },
      },
    });

    return NextResponse.json({
      message: 'Payment initiated successfully',
      url: createPaymentResponse.bkashURL,
      orderId: orderNumber,
      paymentMethod: 'BKASH',
    });
  } catch (error) {
    // biome-ignore lint: error
    throw error;
  }
}
