import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { PaymentData } from '@/lib/types';

const myUrl = process.env.NEXT_PUBLIC_SITE_URL;

export async function handleCODOrder(
  data: PaymentData,
  userId: string,
  orderNumber: string
) {
  try {
    const productIds = data.cart.map((item) => item.productId);

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
        status: 'PROCESSING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH_ON_DELIVERY',
        subtotal: data.pricing.subtotal,
        tax: 0,
        shipping: data.pricing.shippingCost,
        discount: data.pricing.discount.amount || 0,
        total: data.pricing.total,
        currency: 'BDT',
        shippingAddress: {
          name: data.shipping.address.name,
          address1:
            `${data.shipping.address.address}, ${data.shipping.address.apartment || ''}`.trim(),
          city: data.shipping.address.city,
          district: data.shipping.address.district,
          postalCode: data.shipping.address.postalCode,
          phone: data.shipping.address.phone,
          email: data.shipping.address.email,
          isDefault: false,
        },
        metadata: {
          paymentMethod: 'CASH_ON_DELIVERY',
          orderProcessing: true,
          confirmedAt: new Date().toISOString(),
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

    await db.cartItem.deleteMany({
      where: {
        userId,
      },
    });

    return NextResponse.json({
      message: 'Order placed successfully',
      url: `${myUrl}/dashboard/order/order-confirmation?orderId=${order.orderNumber}`,
      orderId: orderNumber,
      paymentMethod: 'CASH_ON_DELIVERY',
      status: 'PROCESSING',
      paymentStatus: 'PENDING',
    });
  } catch (error) {
    console.error('COD order creation error:', error);
    throw error;
  }
}
