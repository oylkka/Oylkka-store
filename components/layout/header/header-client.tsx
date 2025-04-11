'use client';

import { Menu, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import SearchBar from './search-bar';

export default function HeaderClient() {
  const [isOpen, setIsOpen] = useState(false);
  const cartItemCount = 3;

  return (
    <div className="flex items-center gap-2">
      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <nav className="flex flex-col gap-6 pt-16">
            <Link
              href="/"
              className="hover:text-primary text-lg font-semibold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <div className="space-y-3">
              <div className="font-semibold">Products</div>
              <div className="ml-4 flex flex-col space-y-2">
                {['clothing', 'accessories', 'footwear'].map((type) => (
                  <Link
                    key={type}
                    href={`/products/${type}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/new-arrivals"
              className="hover:text-primary text-lg font-semibold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              New Arrivals
            </Link>
            <Link
              href="/sale"
              className="text-lg font-semibold text-red-500 transition-colors hover:text-red-600"
              onClick={() => setIsOpen(false)}
            >
              Sale
            </Link>
            <Link
              href="/about"
              className="hover:text-primary text-lg font-semibold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          <span className="text-primary">Mook</span>kly
        </h1>
      </Link>

      {/* Mobile Search */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Search"
        onClick={() => setIsOpen(true)}
      >
        <SearchBar.Icon />
      </Button>

      {/* Cart */}
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
    </div>
  );
}
