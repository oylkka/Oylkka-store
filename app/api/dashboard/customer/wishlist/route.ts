import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
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
      return new NextResponse('Product already in wishlist', { status: 400 });
    }

    await db.wishlistItem.create({
      data: {
        productId,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Product added to wishlist' },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error('[ADD_TO_WISHLIST_ERROR]', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
