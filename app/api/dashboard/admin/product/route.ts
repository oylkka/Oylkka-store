import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { DeleteImage } from '@/features/cloudinary';
import { db } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json('Not Found', { status: 404 });
    }

    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json('Unauthorized', { status: 401 });
    }

    const product = await db.product.findUnique({
      where: { id },
      select: {
        productName: true,
        shop: {
          select: {
            ownerId: true,
          },
        },
        images: {
          select: { url: true, publicId: true },
        },
        variants: {
          select: {
            image: {
              select: { url: true, publicId: true },
            },
          },
        },
        sku: true,
        slug: true,
      },
    });

    if (!product) {
      return NextResponse.json('Not Found', { status: 404 });
    }

    // Prevent deletion if product is in a pending order
    const pendingOrder = await db.orderItem.findFirst({
      where: {
        productSku: product.sku,
        order: { status: 'PENDING' },
      },
    });
    if (pendingOrder) {
      return NextResponse.json('Cannot delete product in a pending order', {
        status: 400,
      });
    }

    // Remove from cart and wishlist
    await db.cartItem.deleteMany({ where: { productId: id } });
    await db.wishlistItem.deleteMany({ where: { productId: id } });

    // Delete review images from Cloudinary
    const reviews = await db.review.findMany({
      where: { productId: id },
      select: { images: { select: { publicId: true } } },
    });
    for (const review of reviews) {
      for (const image of review.images) {
        if (image.publicId) {
          await DeleteImage(image.publicId);
        }
      }
    }

    // Delete product images
    for (const image of product.images) {
      if (image.publicId) {
        await DeleteImage(image.publicId);
      }
    }

    // Delete variant images
    for (const variant of product.variants) {
      if (variant.image?.publicId) {
        await DeleteImage(variant.image.publicId);
      }
    }

    // Delete reviews
    await db.review.deleteMany({ where: { productId: id } });

    // Delete the product
    await db.product.delete({ where: { id } });

    // Notify the vendor
    if (product.shop?.ownerId) {
      await db.notification.create({
        data: {
          type: 'WARNING',
          title: 'Product Deleted',
          recipientId: product.shop.ownerId,
          message: `Your product "${product.productName}" has been deleted by an admin.`,
        },
      });
      // biome-ignore lint: error
      const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
      const channel = ably.channels.get(`user:${product.shop.ownerId}`);
      await channel.publish('new-notification', {});
    }

    return NextResponse.json('Deleted', { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
