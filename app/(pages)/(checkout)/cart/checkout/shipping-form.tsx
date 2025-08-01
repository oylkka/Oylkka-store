'use client';

import { ChevronRight, Package, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { SHIPPING_THRESHOLD, shippingOptions } from './checkout-constants';
import type { AddressData } from './checkout-type';

interface ShippingFormProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  addressData: AddressData;
  subtotal: number;
  promoCode: string;
}

export function ShippingForm({
  selectedMethod,
  onMethodChange,
  onSubmit,
  onBack,
  addressData,
  subtotal,
  promoCode,
}: ShippingFormProps) {
  const isFreeShipping =
    subtotal >= SHIPPING_THRESHOLD || promoCode === 'FREESHIP';

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Truck className='h-5 w-5' />
          Shipping Method
        </CardTitle>
        <CardDescription>Select your preferred shipping method</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className='space-y-6'
        >
          <RadioGroup
            value={selectedMethod}
            onValueChange={onMethodChange}
            className='space-y-4'
          >
            <div className='flex items-center space-x-3 rounded-lg border p-4'>
              <RadioGroupItem value='standard' id='standard' />
              <div className='flex-1'>
                <label
                  htmlFor='standard'
                  className='flex cursor-pointer items-center justify-between'
                >
                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4' />
                    <div>
                      <div className='font-medium'>
                        {shippingOptions.standard.name}
                        {isFreeShipping && selectedMethod === 'standard' && (
                          <span className='ml-2 text-sm font-medium text-green-600'>
                            (Free)
                          </span>
                        )}
                      </div>
                      <div className='text-muted-foreground text-sm'>
                        {shippingOptions.standard.description}
                      </div>
                    </div>
                  </div>
                  <div className='font-bold'>
                    {isFreeShipping && selectedMethod === 'standard' ? (
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-sm line-through'>
                          ৳{shippingOptions.standard.cost}
                        </span>
                        <span className='text-green-600'>Free</span>
                      </div>
                    ) : (
                      <span>৳{shippingOptions.standard.cost}</span>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className='flex items-center space-x-3 rounded-lg border p-4'>
              <RadioGroupItem value='express' id='express' />
              <div className='flex-1'>
                <label
                  htmlFor='express'
                  className='flex cursor-pointer items-center justify-between'
                >
                  <div className='flex items-center gap-2'>
                    <Truck className='h-4 w-4' />
                    <div>
                      <div className='font-medium'>
                        {shippingOptions.express.name}
                      </div>
                      <div className='text-muted-foreground text-sm'>
                        {shippingOptions.express.description}
                      </div>
                    </div>
                  </div>
                  <div className='font-bold'>
                    ৳{shippingOptions.express.cost}
                  </div>
                </label>
              </div>
            </div>
          </RadioGroup>

          {subtotal >= SHIPPING_THRESHOLD && (
            <div className='rounded-lg bg-green-50 p-4 text-sm text-green-800'>
              🎉 You qualify for free standard shipping!
            </div>
          )}

          <div className='bg-muted/50 rounded-lg border p-4'>
            <h3 className='mb-2 font-medium'>Delivery Address</h3>
            <div className='text-muted-foreground space-y-1 text-sm'>
              <p className='text-foreground font-medium'>{addressData.name}</p>
              <p>{addressData.address}</p>
              {addressData.apartment && <p>{addressData.apartment}</p>}
              <p>
                {addressData.city}, {addressData.district}{' '}
                {addressData.postalCode}
              </p>
              <p>{addressData.phone}</p>
            </div>
          </div>

          <div className='flex justify-between'>
            <Button variant='outline' type='button' onClick={onBack}>
              Back
            </Button>
            <Button type='submit' className='flex items-center gap-2'>
              Continue to Payment
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
