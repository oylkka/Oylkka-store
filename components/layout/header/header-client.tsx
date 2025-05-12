'use client';

import { Menu, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import SearchBar from './search-bar';

export default function HeaderClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center">
      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[300px] px-4 pt-10 pb-4 sm:w-[400px]"
        >
          <SheetHeader className="hidden">
            <SheetTitle> Mobile Menu</SheetTitle>
          </SheetHeader>
          <div className="mb-4">
            <SearchBar isMobile />
          </div>

          <ScrollArea className="h-[calc(100vh-120px)] pr-2">
            <nav className="flex flex-col gap-6">
              <Link
                href="/"
                className="hover:text-primary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              <Accordion type="multiple" className="w-full space-y-2">
                {/* Products */}
                <AccordionItem value="products">
                  <AccordionTrigger className="text-lg font-medium">
                    Products
                  </AccordionTrigger>
                  <AccordionContent className="ml-4 flex flex-col space-y-3">
                    <Link href="/products" onClick={() => setIsOpen(false)}>
                      All
                    </Link>
                    <Link
                      href="/products/clothing"
                      onClick={() => setIsOpen(false)}
                    >
                      Clothing
                    </Link>
                    <Link
                      href="/products/accessories"
                      onClick={() => setIsOpen(false)}
                    >
                      Accessories
                    </Link>
                    <Link
                      href="/products/footwear"
                      onClick={() => setIsOpen(false)}
                    >
                      Footwear
                    </Link>
                    <Link
                      href="/products/jewelry"
                      onClick={() => setIsOpen(false)}
                    >
                      Jewelry
                    </Link>
                    <Link
                      href="/products/watches"
                      onClick={() => setIsOpen(false)}
                    >
                      Watches
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                {/* Collections */}
                <AccordionItem value="collections">
                  <AccordionTrigger className="text-lg font-medium">
                    Collections
                  </AccordionTrigger>
                  <AccordionContent className="ml-4 flex flex-col space-y-3">
                    <Link
                      href="/collections/summer"
                      onClick={() => setIsOpen(false)}
                    >
                      Summer
                    </Link>
                    <Link
                      href="/collections/winter"
                      onClick={() => setIsOpen(false)}
                    >
                      Winter
                    </Link>
                    <Link
                      href="/collections/spring"
                      onClick={() => setIsOpen(false)}
                    >
                      Spring
                    </Link>
                    <Link
                      href="/collections/fall"
                      onClick={() => setIsOpen(false)}
                    >
                      Fall
                    </Link>
                    <Link
                      href="/collections/festival"
                      onClick={() => setIsOpen(false)}
                    >
                      Festival
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                {/* Categories */}
                <AccordionItem value="categories">
                  <AccordionTrigger className="text-lg font-medium">
                    Categories
                  </AccordionTrigger>
                  <AccordionContent className="ml-4 flex flex-col space-y-3">
                    <Link
                      href="/categories/men"
                      onClick={() => setIsOpen(false)}
                    >
                      Men
                    </Link>
                    <Link
                      href="/categories/women"
                      onClick={() => setIsOpen(false)}
                    >
                      Women
                    </Link>
                    <Link
                      href="/categories/kids"
                      onClick={() => setIsOpen(false)}
                    >
                      Kids
                    </Link>
                    <Link
                      href="/categories/unisex"
                      onClick={() => setIsOpen(false)}
                    >
                      Unisex
                    </Link>
                    <Link
                      href="/categories/plus-size"
                      onClick={() => setIsOpen(false)}
                    >
                      Plus Size
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                {/* Support */}
                <AccordionItem value="support">
                  <AccordionTrigger className="text-lg font-medium">
                    Support
                  </AccordionTrigger>
                  <AccordionContent className="ml-4 flex flex-col space-y-3">
                    <Link href="/faq" onClick={() => setIsOpen(false)}>
                      FAQ
                    </Link>
                    <Link href="/shipping" onClick={() => setIsOpen(false)}>
                      Shipping
                    </Link>
                    <Link href="/returns" onClick={() => setIsOpen(false)}>
                      Returns
                    </Link>
                    <Link href="/contact" onClick={() => setIsOpen(false)}>
                      Contact Us
                    </Link>
                    <Link href="/help-center" onClick={() => setIsOpen(false)}>
                      Help Center
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                {/* Account */}
                <AccordionItem value="account">
                  <AccordionTrigger className="text-lg font-medium">
                    Account
                  </AccordionTrigger>
                  <AccordionContent className="ml-4 flex flex-col space-y-3">
                    <Link
                      href="/account/login"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/account/register"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setIsOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={() => setIsOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setIsOpen(false)}
                    >
                      Settings
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Link
                href="/new-arrivals"
                className="hover:text-primary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                href="/sale"
                className="flex items-center text-lg font-medium text-red-500 transition-colors hover:text-red-600"
                onClick={() => setIsOpen(false)}
              >
                Sale
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                  20% OFF
                </span>
              </Link>
              <Link
                href="/about"
                className="hover:text-primary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/blog"
                className="hover:text-primary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/careers"
                className="hover:text-primary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Careers
              </Link>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5">
        <div className="relative">
          <div className="bg-primary/20 absolute -inset-1 rounded-full blur-sm" />
          <ShoppingBag className="text-primary relative h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-2xl">
          <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">
            Oyl
          </span>
          <span className="font-medium">kka</span>
        </h1>
      </Link>
    </div>
  );
}
