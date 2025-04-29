'use client';

import { Menu, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function HeaderClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center">
      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
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
        <ShoppingBag className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          <span className="text-primary">Oyl</span>kka
        </h1>
      </Link>
    </div>
  );
}
