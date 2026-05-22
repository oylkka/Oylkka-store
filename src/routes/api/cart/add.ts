import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/cart/add')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const body = await request.json();
          const { productId, variantId, quantity } = body;

          if (!productId || !quantity || quantity < 1) {
            return Response.json(
              { error: 'Product ID and valid quantity are required' },
              { status: 400 },
            );
          }

          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
              id: true,
              price: true,
              discountPrice: true,
              stock: true,
              hasVariants: true,
            },
          });

          if (!product) {
            return Response.json(
              { error: 'Product not found' },
              { status: 404 },
            );
          }

          if (product.stock < 1) {
            return Response.json(
              { error: 'Product is out of stock' },
              { status: 400 },
            );
          }

          if (product.hasVariants && !variantId) {
            return Response.json(
              { error: 'Variant selection is required for this product' },
              { status: 400 },
            );
          }

          if (variantId) {
            const variant = await prisma.productVariant.findUnique({
              where: { id: variantId },
              select: {
                id: true,
                stock: true,
                price: true,
                discountPrice: true,
              },
            });

            if (!variant) {
              return Response.json(
                { error: 'Variant not found' },
                { status: 404 },
              );
            }

            if (variant.stock < 1) {
              return Response.json(
                { error: 'Variant is out of stock' },
                { status: 400 },
              );
            }
          }

          const savedPrice = product.discountPrice ?? product.price;

          let cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
          });

          if (!cart) {
            cart = await prisma.cart.create({
              data: { userId: session.user.id },
            });
          }

          if (variantId) {
            const existingItem = await prisma.cartItem.findFirst({
              where: { cartId: cart.id, productId, variantId },
            });

            if (existingItem) {
              await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
              });
            } else {
              await prisma.cartItem.create({
                data: {
                  cartId: cart.id,
                  productId,
                  variantId,
                  quantity,
                  savedPrice,
                },
              });
            }
          } else {
            const existingItem = await prisma.cartItem.findFirst({
              where: { cartId: cart.id, productId, variantId: null },
            });

            if (existingItem) {
              await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
              });
            } else {
              await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity, savedPrice },
              });
            }
          }

          const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      productName: true,
                      slug: true,
                      price: true,
                      discountPrice: true,
                      stock: true,
                      hasVariants: true,
                      images: {
                        take: 1,
                        orderBy: { order: 'asc' },
                        select: { imageUrl: true },
                      },
                      shop: {
                        select: { id: true, name: true, slug: true },
                      },
                    },
                  },
                  variant: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                      discountPrice: true,
                      stock: true,
                      imageUrl: true,
                    },
                  },
                },
                orderBy: { createdAt: 'asc' },
              },
            },
          });

          return Response.json(
            { message: 'Added to cart', cart: updatedCart },
            { status: 200 },
          );
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Internal Server Error',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
