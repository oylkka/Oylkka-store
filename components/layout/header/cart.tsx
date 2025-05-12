import Link from 'next/link';

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
import { auth } from '@/features/auth/auth';

import CartBadge from './cart-badge';
import CartClient from './cart-client';

export default async function Cart() {
  const session = await auth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <CartBadge />
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>Your Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="mx-4 flex-1 overflow-auto">
          {session ? (
            <CartClient />
          ) : (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 p-8 text-center">
              <p className="text-muted-foreground">Sign in to see your cart</p>
              <Link href="/auth/signin">
                <Button variant="outline" size="sm" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {session && (
          <SheetFooter className="mt-auto border-t px-4 py-4">
            <SheetClose asChild>
              <Link href="/cart/checkout" className="w-full">
                <Button className="w-full rounded-full font-medium shadow-sm">
                  CHECKOUT
                </Button>
              </Link>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
