'use client';

import { ShoppingBag, Tag, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserCart } from '@/services';

// Types
interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  variantName: string;
  image: {
    url: string;
    alt: string;
  };
}

interface OrderSummaryProps {
  cartItems?: CartItem[];
  shippingCost?: number;
  isLoading?: boolean;
  onPromoCodeApplied?: (code: string, discountPercent: number) => void;
}

export default function OrderSummary({
  cartItems,
  shippingCost = 120,
  isLoading = false,
  onPromoCodeApplied,
}: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const shippingThreshold = 2000;

  const { isPending, data: fetchedCartData, isError } = useUserCart();

  const data = cartItems || fetchedCartData;

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };

  const applyPromoCode = () => {
    if (!promoCode) {
      toast.error('Please enter a promo code');
      return;
    }

    if (appliedPromoCode) {
      toast.error('You can only apply one promo code at a time');
      return;
    }

    const upperCaseCode = promoCode.toUpperCase();

    if (upperCaseCode === 'WELCOME10') {
      setDiscount(10);
      setAppliedPromoCode(upperCaseCode);
      if (onPromoCodeApplied) {
        onPromoCodeApplied(upperCaseCode, 10);
      }
      toast.success('10% discount applied!');
    } else if (upperCaseCode === 'FREESHIP') {
      setAppliedPromoCode(upperCaseCode);
      if (onPromoCodeApplied) {
        onPromoCodeApplied(upperCaseCode, 0);
      }
      toast.success('Free shipping applied!');
    } else {
      toast.error('Invalid promo code');
    }

    setPromoCode('');
  };

  const removePromoCode = () => {
    setAppliedPromoCode('');
    setDiscount(0);
    if (onPromoCodeApplied) {
      onPromoCodeApplied('', 0);
    }
    toast.success('Promo code removed');
  };

  const subtotal =
    data?.reduce((acc: number, item: CartItem) => {
      const price = item.discountPrice ?? item.price;
      return acc + price * item.quantity;
    }, 0) ?? 0;

  const finalShippingCost = subtotal >= shippingThreshold ? 0 : shippingCost;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + finalShippingCost - discountAmount;

  if (isPending || isLoading) {
    return (
      <div className='lg:col-span-1'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-40' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[1, 2].map((item) => (
                <div key={item} className='flex justify-between'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-16' />
                </div>
              ))}
              <Separator />
              <div className='space-y-2'>
                {[1, 2, 3].map((item) => (
                  <div key={item} className='flex justify-between'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                ))}
              </div>
              <Separator />
              <div className='flex justify-between'>
                <Skeleton className='h-5 w-12' />
                <Skeleton className='h-5 w-20' />
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex-col space-y-4'>
            <div className='bg-muted w-full rounded-md p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-12' />
              </div>
              <div className='flex'>
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='lg:col-span-1'>
        <Card className='border-red-200'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center justify-center space-y-2 p-4 text-center'>
              <ShoppingBag className='h-8 w-8 text-red-500' />
              <p className='font-medium text-red-500'>
                Error loading cart items
              </p>
              <p className='text-muted-foreground text-sm'>
                Please try refreshing the page
              </p>
              <Button
                variant='outline'
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='lg:col-span-1'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center justify-center space-y-2 p-4 text-center'>
              <ShoppingBag className='text-muted-foreground h-8 w-8' />
              <p className='font-medium'>Your cart is empty</p>
              <p className='text-muted-foreground text-sm'>
                Add items to your cart to see them here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='lg:col-span-1'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <ShoppingBag className='mr-2 h-5 w-5' />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {data.map((item: CartItem) => (
              <div key={item.id}>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    {item.image.url && (
                      <div className='h-10 w-10 overflow-hidden rounded-md'>
                        <Image
                          src={item.image.url}
                          alt={item.name}
                          width={40}
                          height={40}
                          className='h-full w-full object-cover'
                        />
                      </div>
                    )}
                    <div>
                      <div className='text-sm font-medium'>{item.name}</div>
                      <div className='text-muted-foreground text-xs'>
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className='text-sm font-medium'>
                    ৳{(item.discountPrice ?? item.price) * item.quantity}
                  </div>
                </div>
                {item.variantName && (
                  <div className='text-muted-foreground text-xs'>
                    {item.variantName}
                  </div>
                )}
              </div>
            ))}

            <Separator />

            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Shipping</span>
                <span>
                  {finalShippingCost === 0 ? 'Free' : `৳${finalShippingCost}`}
                </span>
              </div>
              {discount > 0 && (
                <div className='flex justify-between text-green-600'>
                  <span>Discount ({discount}%)</span>
                  <span>-৳{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className='flex justify-between text-lg font-semibold'>
              <span>Total</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex-col space-y-4'>
          <div className='bg-muted w-full rounded-md p-4'>
            {appliedPromoCode ? (
              <div className='mb-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    Applied promo code:
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <Badge variant='outline' className='bg-green-50 px-3 py-1'>
                    <Tag className='mr-2 h-3 w-3 text-green-600' />
                    <span className='text-green-700'>{appliedPromoCode}</span>
                  </Badge>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={removePromoCode}
                    className='text-red-500 hover:bg-red-50 hover:text-red-700'
                  >
                    <X className='h-4 w-4' />
                    <span className='ml-1'>Remove</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className='mb-2 flex items-center'>
                  <Tag className='text-muted-foreground mr-2 h-4 w-4' />
                  <span className='text-sm font-medium'>
                    Have a promo code?
                  </span>
                </div>
                <div className='flex space-x-2'>
                  <Input
                    placeholder='Enter code'
                    value={promoCode}
                    onChange={handlePromoCodeChange}
                  />
                  <Button onClick={applyPromoCode}>Apply</Button>
                </div>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
