import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@/features/auth/auth'; // Import your auth module
import { bkashConfig } from '@/lib/bkash';
import { db } from '@/lib/db';
import { CartItem, PaymentData } from '@/lib/types';
import { createPayment } from '@/services/bkash';

const myUrl = process.env.NEXT_PUBLIC_SITE_URL;

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const data: PaymentData = await req.json();
    const myUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // Validate required environment variable
    if (!myUrl) {
      console.error('NEXT_PUBLIC_SITE_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate cart items against database
    const validationResult = await validateCartData(data.cart);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // Validate total calculation
    if (!validateTotalCalculation(data)) {
      return NextResponse.json(
        { error: 'Total price calculation mismatch' },
        { status: 400 }
      );
    }

    // Validate shipping method and cost
    if (!validateShipping(data.shipping)) {
      return NextResponse.json(
        { error: 'Invalid shipping information' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!validatePaymentMethod(data.payment.method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Check payment method and handle accordingly
    const paymentMethod = data.payment.method.toLowerCase();

    if (paymentMethod === 'nagad') {
      return NextResponse.json(
        { error: 'Nagad payment is not implemented yet' },
        { status: 501 }
      );
    }

    const orderNumber = uuidv4().substring(0, 10);

    // Handle Cash on Delivery (COD)
    if (paymentMethod === 'cod') {
      return await handleCODOrder(data, userId, orderNumber);
    }

    // Handle bKash payment
    if (paymentMethod === 'bkash') {
      return await handleBkashPayment(data, userId, orderNumber, myUrl);
    }

    // This should never happen due to validation, but just in case
    return NextResponse.json(
      { error: 'Unsupported payment method' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function handleCODOrder(
  data: PaymentData,
  userId: string,
  orderNumber: string
) {
  try {
    // Create order with PROCESSING status for COD (ready to be processed)
    const order = await db.order.create({
      data: {
        orderNumber,
        user: {
          connect: { id: userId },
        },
        status: 'PROCESSING', // COD orders can be processed immediately
        paymentStatus: 'PENDING', // Payment will be collected on delivery
        paymentMethod: 'CASH_ON_DELIVERY',
        subtotal: data.pricing.subtotal,
        tax: 0, // Adjust as needed
        shipping: data.pricing.shippingCost,
        discount: data.pricing.discount.amount || 0,
        total: data.pricing.total,
        currency: 'BDT', // Bangladesh Taka
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
          cartData: JSON.parse(JSON.stringify(data.cart)),
        },
        items: {
          create: data.cart.map((item) => ({
            productSku: item.productId,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            discount: item.discountPrice ? item.price - item.discountPrice : 0,
            variantInfo: {},
          })),
        },
      },
    });

    // TODO: You might want to reduce stock quantities here for COD orders
    // await reduceStockQuantities(data.cart);

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

async function handleBkashPayment(
  data: PaymentData,
  userId: string,
  orderNumber: string,
  myUrl: string
) {
  try {
    // Create order with PENDING status for bKash payment
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
          paymentPending: true,
          cartData: JSON.parse(JSON.stringify(data.cart)),
        },
        items: {
          create: data.cart.map((item) => ({
            productSku: item.productId,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            discount: item.discountPrice ? item.price - item.discountPrice : 0,
            variantInfo: {},
          })),
        },
      },
    });

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
      paymentDetails
    );

    if (createPaymentResponse.statusCode !== '0000') {
      // Update order status to FAILED
      await db.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: 'FAILED',
          metadata: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    console.error('bKash payment error:', error);
    throw error;
  }
}

async function validateCartData(cart: CartItem[]) {
  try {
    // Check if cart is empty
    if (!cart || cart.length === 0) {
      return { valid: false, error: 'Cart is empty' };
    }

    // Extract product and variant IDs from cart
    const productIds = new Set<string>();
    const variantIds = new Set<string>();

    // Separate product IDs and variant IDs
    cart.forEach((item) => {
      if (item.variantId) {
        variantIds.add(item.variantId);
      } else {
        productIds.add(item.productId);
      }
    });

    // Fetch base products
    const baseProducts = await db.product.findMany({
      where: {
        id: {
          in: Array.from(productIds),
        },
      },
      select: {
        id: true,
        productName: true,
        price: true,
        discountPrice: true,
        stock: true,
      },
    });

    // Fetch product variants
    const productVariants =
      variantIds.size > 0
        ? await db.productVariant.findMany({
            where: {
              id: {
                in: Array.from(variantIds),
              },
            },
            include: {
              product: {
                select: {
                  productName: true,
                },
              },
            },
          })
        : [];

    // Create maps for easy lookup
    const baseProductMap = new Map(
      baseProducts.map((product) => [product.id, product])
    );

    const variantMap = new Map(
      productVariants.map((variant) => [variant.id, variant])
    );

    // Validate each cart item
    for (const item of cart) {
      if (item.variantId) {
        // This is a variant product
        const variant = variantMap.get(item.variantId);

        if (!variant) {
          return {
            valid: false,
            error: `Product variant ${item.variantId} not found`,
          };
        }

        // Check variant price
        if (item.price !== variant.price) {
          return {
            valid: false,
            error: `Price mismatch for variant ${item.variantId}`,
          };
        }

        // Check variant discount price if applicable
        if (
          (item.discountPrice !== null &&
            item.discountPrice !== undefined &&
            variant.discountPrice === null) ||
          (item.discountPrice !== null &&
            item.discountPrice !== undefined &&
            item.discountPrice !== variant.discountPrice)
        ) {
          return {
            valid: false,
            error: `Discount price mismatch for variant ${item.variantId}`,
          };
        }

        // Check variant stock availability
        if (variant.stock < item.quantity) {
          return {
            valid: false,
            error: `Insufficient stock for variant ${item.name || variant.product.productName}`,
          };
        }

        // For variants, the name might be combined (product name + variant name)
        // We're more lenient with name validation for variants as formatting may vary
      } else {
        // This is a base product
        const product = baseProductMap.get(item.productId);

        if (!product) {
          return {
            valid: false,
            error: `Product ${item.productId} not found`,
          };
        }

        // Check product name
        if (item.name !== product.productName) {
          return {
            valid: false,
            error: `Product name mismatch for ${item.productId}`,
          };
        }

        // Check product price
        if (item.price !== product.price) {
          return {
            valid: false,
            error: `Price mismatch for ${item.productId}`,
          };
        }

        // Check product discount price if applicable
        if (
          (item.discountPrice !== null &&
            item.discountPrice !== undefined &&
            product.discountPrice === null) ||
          (item.discountPrice !== null &&
            item.discountPrice !== undefined &&
            item.discountPrice !== product.discountPrice)
        ) {
          return {
            valid: false,
            error: `Discount price mismatch for ${item.productId}`,
          };
        }

        // Check product stock availability
        if (product.stock < item.quantity) {
          return {
            valid: false,
            error: `Insufficient stock for ${item.name}`,
          };
        }
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Cart validation error:', error);
    return { valid: false, error: 'Database error during cart validation' };
  }
}

function validateTotalCalculation(data: PaymentData) {
  // Calculate subtotal based on cart items
  const calculatedSubtotal = data.cart.reduce((total, item) => {
    const itemPrice =
      item.discountPrice !== null && item.discountPrice !== undefined
        ? item.discountPrice
        : item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  // Check if calculated subtotal matches the provided subtotal
  if (calculatedSubtotal !== data.pricing.subtotal) {
    return false;
  }

  // Check if total is correct (subtotal + shipping - discount)
  const calculatedTotal =
    calculatedSubtotal +
    data.pricing.shippingCost -
    data.pricing.discount.amount;

  return calculatedTotal === data.pricing.total;
}

function validateShipping(shipping: PaymentData['shipping']) {
  // Check if shipping method is valid
  const validMethods = ['standard', 'express', 'pickup'];
  if (!validMethods.includes(shipping.method)) {
    return false;
  }

  // Validate free shipping logic
  if (shipping.freeShippingApplied && shipping.cost !== 0) {
    return false;
  }

  // Basic validation of shipping address
  const address = shipping.address;
  if (
    !address.email ||
    !address.name ||
    !address.address ||
    !address.city ||
    !address.district ||
    !address.postalCode ||
    !address.phone
  ) {
    return false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(address.email)) {
    return false;
  }

  // Phone validation (basic)
  if (address.phone.length < 6) {
    return false;
  }

  return true;
}

function validatePaymentMethod(method: string) {
  const validMethods = ['bkash', 'cod', 'nagad'];
  return validMethods.includes(method.toLowerCase());
}
