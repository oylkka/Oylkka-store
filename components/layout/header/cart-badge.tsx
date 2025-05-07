// CartBadge.tsx (Client Component)
'use client';

import { ShoppingBag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SheetTrigger } from '@/components/ui/sheet';
import { useUserCart } from '@/services';

export default function CartBadge() {
  // Fetch cart data using the same hook from CartClient
  const { data } = useUserCart();

  // Calculate total items in cart
  const cartItemCount = data?.length || 0;

  return (
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingBag className="h-5 w-5" />
        {cartItemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
          >
            {cartItemCount}
          </Badge>
        )}
        <span className="sr-only">Shopping cart</span>
      </Button>
    </SheetTrigger>
  );
}
