import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { getAuthenticatedUser } from '@/features/auth/get-user';
import type { PaymentData } from '@/lib/types';

import { handleBkashPayment } from './bkash-payment';
import { handleCODOrder } from './cod-order';
import {
  validateCartData,
  validatePaymentMethod,
  validateShipping,
  validateTotalCalculation,
} from './validation';

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = user.id;
    const data: PaymentData = await req.json();
    const myUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // Validate required environment variable
    if (!myUrl) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    // Validate cart items against database
    const validationResult = await validateCartData(data.cart);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 },
      );
    }

    // Validate total calculation
    if (!validateTotalCalculation(data)) {
      return NextResponse.json(
        { error: 'Total price calculation mismatch' },
        { status: 400 },
      );
    }

    // Validate shipping method and cost
    if (!validateShipping(data.shipping)) {
      return NextResponse.json(
        { error: 'Invalid shipping information' },
        { status: 400 },
      );
    }

    // Validate payment method
    if (!validatePaymentMethod(data.payment.method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 },
      );
    }

    // Check payment method and handle accordingly
    const paymentMethod = data.payment.method.toLowerCase();

    if (paymentMethod === 'nagad') {
      return NextResponse.json(
        { error: 'Nagad payment is not implemented yet' },
        { status: 501 },
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
      { status: 400 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
