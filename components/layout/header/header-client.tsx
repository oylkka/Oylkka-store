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
import { ThemeSwitcher } from './theme-switcher';

export default function HeaderClient() {
  const [isOpen, setIsOpen] = useState(false);

  // Function to close the sheet
  const closeSheet = () => setIsOpen(false);

  return (
    <div className='flex items-center'>
      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='m-0 w-fit pr-2 md:hidden'
            aria-label='Open menu'
          >
            <Menu className='h-5 w-5 transition-transform duration-200' />
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side='left'
          className='flex w-[300px] flex-col border-r p-0 sm:w-[400px] h-screen'
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <SheetHeader className='border-b'>
            <SheetTitle className='flex items-center gap-2 text-left'>
              <div className='relative'>
                <div className='bg-primary/20 absolute -inset-1 rounded-full blur-sm' />
                <ShoppingBag className='text-primary relative h-6 w-6' />
              </div>
              <span className='text-2xl font-bold tracking-tight'>
                <span className='from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent'>
                  Oyl
                </span>
                <span className='font-medium'>kka</span>
              </span>
            </SheetTitle>
          </SheetHeader>
          {/* Added explicit overflow-y-auto and pb-4 to the inner div */}
          <ScrollArea className='flex-1 pr-2 pb-20 overflow-y-auto'>
            <div className='pb-4'>
              {/* Search Bar for mobile menu */}
              <div className='px-3 pb-3'>
                {/* Pass the closeSheet function to SearchBar */}
                <SearchBar className='h-9 w-full' onSearchSubmit={closeSheet} />
              </div>
              <nav className='flex flex-col'>
                <Link
                  href='/'
                  className='hover:bg-muted/50 hover:text-primary flex items-center rounded-md px-3 py-2 text-lg font-medium transition-colors'
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Accordion type='multiple' className='w-full space-y-2'>
                  {/* Products */}
                  <AccordionItem value='products' className='border-b-0'>
                    <AccordionTrigger className='hover:bg-muted/50 rounded-md px-3 py-2 text-lg font-medium'>
                      Products
                    </AccordionTrigger>
                    <AccordionContent className='ml-4 flex flex-col space-y-2 pt-1'>
                      <Link
                        href='/products'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        All
                      </Link>
                      <Link
                        href='/products/clothing'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Clothing
                      </Link>
                      <Link
                        href='/products/accessories'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Accessories
                      </Link>
                      <Link
                        href='/products/footwear'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Footwear
                      </Link>
                      <Link
                        href='/products/jewelry'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Jewelry
                      </Link>
                      <Link
                        href='/products/watches'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Watches
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Collections */}
                  <AccordionItem value='collections' className='border-b-0'>
                    <AccordionTrigger className='hover:bg-muted/50 rounded-md px-3 py-2 text-lg font-medium'>
                      Collections
                    </AccordionTrigger>
                    <AccordionContent className='ml-4 flex flex-col space-y-3 pt-2'>
                      <Link
                        href='/collections/summer'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Summer
                      </Link>
                      <Link
                        href='/collections/winter'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Winter
                      </Link>
                      <Link
                        href='/collections/spring'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Spring
                      </Link>
                      <Link
                        href='/collections/fall'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Fall
                      </Link>
                      <Link
                        href='/collections/festival'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Festival
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Categories */}
                  <AccordionItem value='categories' className='border-b-0'>
                    <AccordionTrigger className='hover:bg-muted/50 rounded-md px-3 py-2 text-lg font-medium'>
                      Categories
                    </AccordionTrigger>
                    <AccordionContent className='ml-4 flex flex-col space-y-3 pt-2'>
                      <Link
                        href='/categories/men'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Men
                      </Link>
                      <Link
                        href='/categories/women'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Women
                      </Link>
                      <Link
                        href='/categories/kids'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Kids
                      </Link>
                      <Link
                        href='/categories/unisex'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Unisex
                      </Link>
                      <Link
                        href='/categories/plus-size'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Plus Size
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Support */}
                  <AccordionItem value='support' className='border-b-0'>
                    <AccordionTrigger className='hover:bg-muted/50 rounded-md px-3 py-2 text-lg font-medium'>
                      Support
                    </AccordionTrigger>
                    <AccordionContent className='ml-4 flex flex-col space-y-3 pt-2'>
                      <Link
                        href='/faq'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        FAQ
                      </Link>
                      <Link
                        href='/shipping'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Shipping
                      </Link>
                      <Link
                        href='/returns'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Returns
                      </Link>
                      <Link
                        href='/contact'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Contact Us
                      </Link>
                      <Link
                        href='/help-center'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Help Center
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Account */}
                  <AccordionItem value='account' className='border-b-0'>
                    <AccordionTrigger className='hover:bg-muted/50 rounded-md px-3 py-2 text-lg font-medium'>
                      Account
                    </AccordionTrigger>
                    <AccordionContent className='ml-4 flex flex-col space-y-3 pt-2'>
                      <Link
                        href='/account/login'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Login
                      </Link>
                      <Link
                        href='/account/register'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Register
                      </Link>
                      <Link
                        href='/account/orders'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        My Orders
                      </Link>
                      <Link
                        href='/account/wishlist'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Wishlist
                      </Link>
                      <Link
                        href='/account/settings'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted/50 rounded-md px-3 py-2 transition-colors'
                      >
                        Settings
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className='space-y-2'>
                  <Link
                    href='/new-arrivals'
                    className='hover:bg-muted/50 hover:text-primary flex items-center rounded-md px-3 py-2 text-lg font-medium transition-colors'
                    onClick={() => setIsOpen(false)}
                  >
                    New Arrivals
                  </Link>
                  <Link
                    href='/sale'
                    className='flex items-center rounded-md px-3 py-2 text-lg font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20'
                    onClick={() => setIsOpen(false)}
                  >
                    Sale
                    <span className='ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white'>
                      20% OFF
                    </span>
                  </Link>
                  <Link
                    href='/about'
                    className='hover:bg-muted/50 hover:text-primary flex items-center rounded-md px-3 py-2 text-lg font-medium transition-colors'
                    onClick={() => setIsOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    href='/blog'
                    onClick={() => setIsOpen(false)}
                    className='hover:bg-muted/50 hover:text-primary flex items-center rounded-md px-3 py-2 text-lg font-medium transition-colors'
                  >
                    Blog
                  </Link>
                  <Link
                    href='/blog'
                    onClick={() => setIsOpen(false)}
                    className='hover:bg-muted/50 hover:text-primary flex items-center rounded-md px-3 py-2 text-lg font-medium transition-colors'
                  >
                    Blog
                  </Link>
                  <Link
                    href='/careers'
                    onClick={() => setIsOpen(false)}
                    className='hover:bg-muted/50 hover:text-primary flex items-center rounded-md px-3 py-2 text-lg font-medium transition-colors'
                  >
                    Careers
                  </Link>
                </div>
              </nav>
              {/* Theme Switcher for mobile menu */}
              <div className='px-3'>
                <ThemeSwitcher mobile switch />
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      {/* Logo */}
      <Link href='/' className='flex items-center gap-1.5'>
        <ShoppingBag className='text-primary relative h-6 w-6' />

        <h1 className='text-2xl font-bold tracking-tight md:text-2xl'>
          <span className='from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent'>
            Oyl
          </span>
          <span className='font-medium'>kka</span>
        </h1>
      </Link>
    </div>
  );
}
