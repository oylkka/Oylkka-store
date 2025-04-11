import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Cart() {
  const cartItemCount = 3;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Your Cart</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 p-2">
          <p className="text-muted-foreground text-center text-sm">
            item in your cart
          </p>
          <DropdownMenuSeparator />
          <div className="flex justify-between py-1 text-sm">
            <span>Subtotal</span>
            <span className="font-medium">$299.00</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/cart" passHref>
              <Button variant="outline" className="w-full">
                View Cart
              </Button>
            </Link>
            <Link href="/checkout" passHref>
              <Button className="w-full">Checkout</Button>
            </Link>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
