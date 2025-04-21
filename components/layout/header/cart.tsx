import Link from 'next/link';

import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import CartBadge from './cart-button-badge';
import CartClient from './cart-client';

export default async function Cart() {
  const session = await auth();

  return (
    <Sheet>
      <CartBadge />
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
            <Link href="/cart/checkout">
              <Button className="w-full">CHECKOUT</Button>
            </Link>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
