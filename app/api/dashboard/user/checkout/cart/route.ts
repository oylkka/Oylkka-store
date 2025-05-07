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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity = 1, variantId } = body;

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    let selectedVariantId = variantId;

    if (product.variants.length > 0) {
      if (!variantId) {
        // If product has variants but variantId is missing, select default variant
        const defaultVariant = product.variants.find((v) => v.stock > 0);
        if (!defaultVariant) {
          return new NextResponse('No available variants in stock', {
            status: 400,
          });
        }
        selectedVariantId = defaultVariant.id;
      }

      const selectedVariant = product.variants.find(
        (v) => v.id === selectedVariantId
      );
      if (!selectedVariant) {
        return new NextResponse('Variant not found', { status: 404 });
      }

      if (selectedVariant.stock < quantity) {
        return new NextResponse('Not enough stock available', { status: 400 });
      }
    } else {
      // Product has no variants, check overall product stock
      if (product.stock < quantity) {
        return new NextResponse('Not enough stock available', { status: 400 });
      }
    }

    // Check if item already in cart
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        variantId: selectedVariantId ?? null,
      },
    });

    if (existingCartItem) {
      await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId: selectedVariantId ?? null,
          quantity,
        },
      });
    }

    return new NextResponse('Item added to cart', { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
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
