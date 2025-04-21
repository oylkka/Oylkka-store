'use client';

import { CreditCard, ShoppingBag, Tag } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

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
import { useUserCart } from '@/service';

// Types
type CartProduct = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  discountPrice: number | null;
  quantity: number;
  imageUrl: string;
};

export default function OrderSummary() {
  const { isPending, data, isError } = useUserCart();
  const [promoCode, setPromoCode] = useState<string>('');
  const shippingThreshold = 1000;

  // Handle promo code
  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };

  const applyPromoCode = () => {
    if (promoCode) {
      setPromoCode('');
    }
  };

  // Calculate costs
  const subtotal =
    data?.reduce((acc: number, item: CartProduct) => {
      const price = item.discountPrice ?? item.price;
      return acc + price * item.quantity;
    }, 0) ?? 0;

  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  const shipping = subtotal > 0 ? 5 : 0;
  const total = subtotal + tax + shipping;
  const shippingCost = 10;

  // Loading state
  if (isPending) {
    return (
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <div className="bg-muted w-full rounded-md p-4">
              <div className="mb-2 flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="lg:col-span-1">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
              <ShoppingBag className="h-8 w-8 text-red-500" />
              <p className="font-medium text-red-500">
                Error loading cart items
              </p>
              <p className="text-muted-foreground text-sm">
                Please try refreshing the page
              </p>
              <Button
                variant="outline"
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
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
              <ShoppingBag className="text-muted-foreground h-8 w-8" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-muted-foreground text-sm">
                Add items to your cart to see them here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((item: CartProduct) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {item.imageUrl && (
                    <div className="h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-start">
                      <span className="mr-1 font-medium">{item.quantity}x</span>
                      <span className="line-clamp-2 max-w-[150px]">
                        {item.productName}
                      </span>
                    </div>
                    {item.discountPrice && (
                      <div className="flex items-center text-xs text-green-600">
                        <Tag className="mr-1 h-3 w-3" />
                        <span className="text-muted-foreground mr-1 line-through">
                          ${item.price.toFixed(2)}
                        </span>
                        <span>${item.discountPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-medium">
                  $
                  {((item.discountPrice ?? item.price) * item.quantity).toFixed(
                    2
                  )}
                </span>
              </div>
            ))}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                {subtotal >= shippingThreshold ? (
                  <p className="line-through">${shippingCost}</p>
                ) : (
                  <p>${shippingCost}</p>
                )}
              </div>
              <div className="flex justify-between">
                <span>Tax (7%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <div className="bg-muted w-full rounded-md p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Promo Code</span>
              <CreditCard className="text-muted-foreground h-4 w-4" />
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={handlePromoCodeChange}
              />
              <Button onClick={applyPromoCode}>Apply</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
