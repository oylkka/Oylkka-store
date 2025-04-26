import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@/features/auth/auth'; // Import your auth module
import { bkashConfig } from '@/lib/bkash';
import { db } from '@/lib/db';
import { createPayment } from '@/services/bkash';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  productName: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
}

interface ShippingAddress {
  email: string;
  name: string;
  address: string;
  apartment: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
}

interface PaymentData {
  cart: CartItem[];
  shipping: {
    address: ShippingAddress;
    method: string;
    cost: number;
    freeShippingApplied: boolean;
  };
  payment: {
    method: string;
  };
  pricing: {
    subtotal: number;
    shippingCost: number;
    discount: {
      code: string;
      percentage: number;
      amount: number;
    };
    total: number;
  };
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  productName: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
}

interface ShippingAddress {
  email: string;
  name: string;
  address: string;
  apartment: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
}

interface PaymentData {
  cart: CartItem[];
  shipping: {
    address: ShippingAddress;
    method: string;
    cost: number;
    freeShippingApplied: boolean;
  };
  payment: {
    method: string;
  };
  pricing: {
    subtotal: number;
    shippingCost: number;
    discount: {
      code: string;
      percentage: number;
      amount: number;
    };
    total: number;
  };
}

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

    const orderNumber = uuidv4().substring(0, 10);

    // Create order with PENDING status
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
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            discount: item.discountPrice ? item.price - item.discountPrice : 0,
            variantInfo: {}, // Add variant info if available
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
      message: 'Payment Success',
      url: createPaymentResponse.bkashURL,
      orderId: orderNumber,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
async function validateCartData(cart: CartItem[]) {
  try {
    // Check if cart is empty
    if (!cart || cart.length === 0) {
      return { valid: false, error: 'Cart is empty' };
    }

    // Extract product IDs to query the database in bulk
    const productIds = cart.map((item) => item.productId);

    // Fetch products from database in a single query
    const dbProducts = await db.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        productName: true,
        price: true,
        discountPrice: true,
        images: true,
        stock: true, // Include stock to check availability
      },
    });

    // Check if all products exist in DB
    if (dbProducts.length !== productIds.length) {
      return {
        valid: false,
        error: 'Some products do not exist in the database',
      };
    }

    // Create a map for easier lookup
    const productMap = new Map(
      dbProducts.map((product) => [product.id, product])
    );

    // Validate each cart item
    for (const item of cart) {
      const dbProduct = productMap.get(item.productId);

      if (!dbProduct) {
        return { valid: false, error: `Product ${item.productId} not found` };
      }

      // Check product name
      if (item.productName !== dbProduct.productName) {
        return {
          valid: false,
          error: `Product name mismatch for ${item.productId}`,
        };
      }

      // Check prices
      if (item.price !== dbProduct.price) {
        return { valid: false, error: `Price mismatch for ${item.productId}` };
      }

      // Check discount price if applicable
      if (
        (item.discountPrice !== null && dbProduct.discountPrice === null) ||
        item.discountPrice !== dbProduct.discountPrice
      ) {
        return {
          valid: false,
          error: `Discount price mismatch for ${item.productId}`,
        };
      }

      // Check image URL
      if (item.imageUrl !== dbProduct.images[0].url) {
        return {
          valid: false,
          error: `Image URL mismatch for ${item.productId}`,
        };
      }

      // Check stock availability
      if (dbProduct.stock < item.quantity) {
        return {
          valid: false,
          error: `Insufficient stock for ${item.productName}`,
        };
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
      item.discountPrice !== null ? item.discountPrice : item.price;
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
  const validMethods = ['bkash', 'card', 'cod', 'nagad', 'rocket'];
  return validMethods.includes(method);
}
