import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import CartClient from './cart-client';


export default async function Cart() {
  const session = await auth();
  const cartItemCount = 3;
  return (
    <Sheet>
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="mx-4">
          {session ? (
            <div>
              <CartClient />
            </div>
          ) : (
            <div>Sign in to see your cart</div>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Link href="/checkout">
              <Button className="w-full">CHECKOUT</Button>
            </Link>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
