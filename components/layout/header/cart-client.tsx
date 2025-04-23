'use client';

import { Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  useRemoveFromCart,
  useUpdateCartQuantity,
  useUserCart,
} from '@/service';

type CartItem = {
  id: string;
  productName: string;
  imageUrl?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
};

export default function CartClient() {
  const { isPending, data, isError } = useUserCart();
  const updateQuantity = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();

  if (isPending) {
    return <div className="flex justify-center p-8">Loading your cart...</div>;
  }

  if (isError) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        Error loading cart items
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="flex justify-center p-8">Your cart is empty</div>;
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem.mutate(itemId);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }
    updateQuantity.mutate({ itemId, quantity: newQuantity });
  };

  const shippingCost = 10;
  const shippingThreshold = 1000;

  const subtotal = data.reduce((acc: number, item: CartItem) => {
    const price = item.discountPrice ?? item.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div>
      <ScrollArea className="h-[50vh] space-y-4 md:h-[55vh]">
        {data.map((item: CartItem) => (
          <div key={item.id} className="grid grid-cols-12 gap-3 border-b pb-4">
            <div className="col-span-3">
              <Image
                src={item.imageUrl || '/fallback-image.png'}
                alt={item.productName}
                className="border object-cover md:h-16 md:w-16"
                width={200}
                height={200}
              />
            </div>
            <div className="col-span-9 space-y-3">
              <div className="flex justify-between gap-4">
                <p className="font-bold">{item.productName}</p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removeItem.isPending}
                  className="transition-colors hover:text-red-500"
                  aria-label="Remove item"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <div className="grid grid-cols-5 items-center justify-center border">
                    <div className="col-span-3 flex items-center justify-center p-0.5 md:p-1">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 border-l">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="flex w-full items-center justify-center border-b p-0.5 hover:bg-gray-100 md:p-1"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        disabled={isPending || item.quantity === 1}
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="flex w-full items-center justify-center p-0.5 hover:bg-gray-100 md:p-1"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  </div>

                  <X size={14} className="text-gray-400" />
                  <p className="text-gray-500">
                    ${item.discountPrice?.toFixed(2) ?? item.price.toFixed(2)}
                  </p>
                </div>

                <p className="font-semibold">
                  $
                  {((item.discountPrice ?? item.price) * item.quantity).toFixed(
                    2
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-white via-white to-transparent" />
      </ScrollArea>

      <div className="mt-4 space-y-2">
        <Slider
          defaultValue={[subtotal + shippingCost]}
          value={[subtotal + shippingCost]}
          max={shippingThreshold}
          step={1}
          disabled
        />

        {subtotal >= shippingThreshold ? (
          <p className="text-primary text-sm">
            🎉 Congratulations! You’ve got free shipping.
          </p>
        ) : (
          <p className="space-x-1 text-sm">
            <span>Spend</span>
            <span className="text-primary">
              ${(shippingThreshold - subtotal).toFixed(0)}
            </span>
            <span>more to get</span>
            <span className="text-lg font-medium uppercase">free shipping</span>
          </p>
        )}

        <Separator />

        <div>
          <div className="flex justify-between text-lg">
            <p>Subtotal:</p>
            <p className="font-bold">${subtotal.toFixed(0)}</p>
          </div>
          <div className="flex justify-between">
            <p>Shipping:</p>
            {subtotal >= shippingThreshold ? (
              <p className="line-through">${shippingCost}</p>
            ) : (
              <p>${shippingCost}</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg">
          <p>Total:</p>
          <p className="font-bold">
            $
            {subtotal >= shippingThreshold
              ? subtotal.toFixed(0)
              : (subtotal + shippingCost).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}
