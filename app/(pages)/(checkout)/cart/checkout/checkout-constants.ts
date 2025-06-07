import type { ShippingOption } from './checkout-type';

export const SHIPPING_THRESHOLD = 2000;

export const shippingOptions: Record<string, ShippingOption> = {
  standard: {
    name: 'Standard Shipping',
    cost: 120,
    description: 'Delivery in 3-5 business days',
  },
  express: {
    name: 'Express Shipping',
    cost: 250,
    description: 'Delivery in 1-2 business days',
  },
};

export const stepProgressMap = {
  information: 25,
  shipping: 50,
  payment: 75,
  review: 100,
} as const;
