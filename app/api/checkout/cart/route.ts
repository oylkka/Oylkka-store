import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

// GET: Fetch user cart items
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const cartItems = await db.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            price: true,
            discountPrice: true,
            images: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    const simplifiedCart = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      productName: item.product.productName,
      price: item.product.price,
      discountPrice: item.product.discountPrice,
      imageUrl: item.product.images?.[0]?.url || '/fallback-image.png',
    }));

    return NextResponse.json(simplifiedCart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: Add to cart
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const quantityParam = searchParams.get('quantity');

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const quantity = quantityParam ? parseInt(quantityParam) : 1;
    if (isNaN(quantity) || quantity < 1) {
      return new NextResponse('Quantity must be a positive number', {
        status: 400,
      });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    const existingCartItem = await db.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
      },
    });

    let response;

    if (existingCartItem) {
      response = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      response = await db.cartItem.create({
        data: {
          userId: session.user.id,
          productId: productId,
          quantity: quantity,
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Cart add error:', error);

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE: Remove from cart
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) {
      return new NextResponse('Cart item ID is required', { status: 400 });
    }

    // Check if item exists and belongs to user
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return new NextResponse('Item not found or unauthorized', {
        status: 404,
      });
    }

    await db.cartItem.delete({
      where: { id: cartItemId },
    });

    return new NextResponse('Item removed successfully');
  } catch (error) {
    console.error('Cart delete error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH: Update cart item quantity
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { itemId, quantity } = await req.json();

    if (!itemId || typeof quantity !== 'number' || quantity < 1) {
      return new NextResponse('Invalid input', { status: 400 });
    }

    // Check if item exists and belongs to user
    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return new NextResponse('Item not found or unauthorized', {
        status: 404,
      });
    }

    const updatedItem = await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Cart update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
