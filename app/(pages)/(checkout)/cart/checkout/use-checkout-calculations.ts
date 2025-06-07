'use client';

import { useMemo } from 'react';

import { SHIPPING_THRESHOLD, shippingOptions } from './checkout-constants';
import type { CartItem } from './checkout-type';

interface UseCheckoutCalculationsProps {
  cartItems: CartItem[];
  shippingMethod: string;
  promoCode: string;
  discount: number;
}

export function useCheckoutCalculations({
  cartItems,
  shippingMethod,
  promoCode,
  discount,
}: UseCheckoutCalculationsProps) {
  return useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const price = item.discountPrice ?? item.price;
      return acc + price * item.quantity;
    }, 0);

    const isFreeShipping =
      (promoCode === 'FREESHIP' && shippingMethod === 'standard') ||
      (subtotal >= SHIPPING_THRESHOLD && shippingMethod === 'standard');

    const shippingCost = isFreeShipping
      ? 0
      : shippingOptions[shippingMethod].cost;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal + shippingCost - discountAmount;

    return {
      subtotal,
      shippingCost,
      discountAmount,
      total,
      isFreeShipping,
    };
  }, [cartItems, shippingMethod, promoCode, discount]);
}
