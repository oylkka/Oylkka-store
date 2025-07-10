import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const wishlistItem = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (wishlistItem) {
      // Product is in wishlist, so remove it
      await db.wishlistItem.delete({
        where: {
          userId_productId: {
            userId: user.id,
            productId: productId,
          },
        },
      });
      return NextResponse.json(
        { message: 'Product removed from wishlist', added: false },
        { status: 200 }
      );
    } else {
      // Product not in wishlist, so add it
      // First, ensure product exists
      const product = await db.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return new NextResponse('Product not found', { status: 404 });
      }

      await db.wishlistItem.create({
        data: {
          productId,
          userId: user.id,
        },
      });

      return NextResponse.json(
        { message: 'Product added to wishlist', added: true },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('[TOGGLE_WISHLIST_ERROR]', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
