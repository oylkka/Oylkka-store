'use client';

import { Check } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { shippingOptions } from './checkout-constants';
import type { AddressData, CartItem, PaymentData } from './checkout-type';

interface OrderReviewProps {
  cartItems: CartItem[];
  addressData: AddressData;
  shippingMethod: string;
  paymentData: PaymentData;
  subtotal: number;
  shippingCost: number;
  discount: number;
  discountAmount: number;
  promoCode: string;
  total: number;
  onBack: () => void;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
}

export function OrderReview({
  cartItems,
  addressData,
  shippingMethod,
  paymentData,
  subtotal,
  shippingCost,
  discount,
  discountAmount,
  promoCode,
  total,
  onBack,
  onPlaceOrder,
  isSubmitting,
}: OrderReviewProps) {
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bkash':
        return 'bKash';
      case 'nagad':
        return 'Nagad';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Check className='h-5 w-5' />
          Review Your Order
        </CardTitle>
        <CardDescription>
          Please review your order before completing your purchase
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Shipping Information */}
        <div>
          <h3 className='mb-3 font-medium'>Shipping Information</h3>
          <div className='bg-muted/50 rounded-lg p-4 text-sm'>
            <p className='font-medium'>{addressData.name}</p>
            <p>{addressData.address}</p>
            {addressData.apartment && <p>{addressData.apartment}</p>}
            <p>
              {addressData.city}, {addressData.district}{' '}
              {addressData.postalCode}
            </p>
            <p>{addressData.phone}</p>
            <p className='text-muted-foreground mt-1'>{addressData.email}</p>
          </div>
        </div>

        {/* Shipping Method */}
        <div>
          <h3 className='mb-3 font-medium'>Shipping Method</h3>
          <div className='bg-muted/50 rounded-lg p-4 text-sm'>
            <p className='font-medium'>
              {shippingOptions[shippingMethod].name}
              {shippingCost === 0 && (
                <span className='ml-2 text-green-600'>(Free)</span>
              )}
            </p>
            <p className='text-muted-foreground'>
              {shippingOptions[shippingMethod].description}
            </p>
            <p className='mt-1'>
              Cost:{' '}
              {shippingCost === 0 ? (
                <span className='text-green-600'>Free</span>
              ) : (
                <span>৳{shippingCost.toFixed(2)}</span>
              )}
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className='mb-3 font-medium'>Payment Method</h3>
          <div className='bg-muted/50 rounded-lg p-4 text-sm'>
            <p className='font-medium'>
              {getPaymentMethodLabel(paymentData.method)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className='mb-4 font-medium'>Order Items</h3>
          <div className='space-y-4'>
            {cartItems.map((item) => (
              <div key={item.id} className='flex items-center gap-4'>
                <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border'>
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.name}
                    width={64}
                    height={64}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='flex-1'>
                  <h4 className='font-medium'>{item.name}</h4>
                  <p className='text-muted-foreground text-sm'>
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className='font-medium'>
                  ৳
                  {((item.discountPrice || item.price) * item.quantity).toFixed(
                    2,
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Summary */}
        <div>
          <h3 className='mb-4 font-medium'>Order Summary</h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Subtotal:</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping:</span>
              {shippingCost === 0 ? (
                <span className='text-green-600'>Free</span>
              ) : (
                <span>৳{shippingCost.toFixed(2)}</span>
              )}
            </div>
            {discount > 0 && (
              <div className='flex justify-between text-green-600'>
                <span>Discount ({discount}%):</span>
                <span>-৳{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {promoCode && (
              <div className='text-muted-foreground flex justify-between'>
                <span>Promo code:</span>
                <span>{promoCode}</span>
              </div>
            )}
            <Separator />
            <div className='flex justify-between text-lg font-bold'>
              <span>Total:</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className='flex justify-between pt-4'>
          <Button variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={onPlaceOrder}
            disabled={isSubmitting}
            size='lg'
            className='min-w-[140px]'
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
