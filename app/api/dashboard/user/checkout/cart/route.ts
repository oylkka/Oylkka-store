import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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



// Define a schema for request validation
const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be a positive number')
    .default(1),
  variantId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request parameters
    const { searchParams } = new URL(req.url);

    // Parse and validate input data
    const validationResult = cartItemSchema.safeParse({
      productId: searchParams.get('productId'),
      quantity: searchParams.get('quantity')
        ? parseInt(searchParams.get('quantity')!)
        : 1,
      variantId: searchParams.get('variantId') || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { productId, quantity, variantId } = validationResult.data;

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify variant exists and belongs to product if provided
    if (variantId) {
      const variant = await db.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        return NextResponse.json(
          { error: 'Variant not found' },
          { status: 404 }
        );
      }

      if (variant.productId !== productId) {
        return NextResponse.json(
          { error: 'Variant does not belong to the specified product' },
          { status: 400 }
        );
      }
    }

    // Check if product is in stock or available for purchase
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Product is not available for purchase' },
        { status: 400 }
      );
    }

    // Check existing cart item
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        variantId,
      },
    });

    let cartItem;
    let isNewItem = false;

    if (existingCartItem) {
      // Update existing cart item
      cartItem = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Create new cart item
      isNewItem = true;
      cartItem = await db.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId,
          quantity,
        },
      });
    }

    // Get total cart items count for response
    const cartItemsCount = await db.cartItem.count({
      where: { userId: session.user.id },
    });

    // Return success response with cart item and metadata
    return NextResponse.json({
      success: true,
      message: isNewItem ? 'Item added to cart' : 'Cart item quantity updated',
      cartItem,
      cartItemsCount,
    });
  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
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
