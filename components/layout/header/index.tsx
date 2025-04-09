'use client';

import { LogOut, Menu, Settings, ShoppingBag, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import SearchBar from './search-bar';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // This would typically come from your auth state management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const cartItemCount = 3;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
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
                  className="text-lg font-semibold transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <div className="space-y-3">
                  <div className="font-semibold">Products</div>
                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      href="/products/clothing"
                      className="text-muted-foreground transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Clothing
                    </Link>
                    <Link
                      href="/products/accessories"
                      className="text-muted-foreground transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Accessories
                    </Link>
                    <Link
                      href="/products/footwear"
                      className="text-muted-foreground transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Footwear
                    </Link>
                  </div>
                </div>
                <Link
                  href="/new-arrivals"
                  className="text-lg font-semibold transition-colors hover:text-primary"
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
                  className="text-lg font-semibold transition-colors hover:text-primary"
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
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden md:block ml-10">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <div>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products/clothing"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Clothing
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Explore our latest clothing collection for all
                            occasions.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <div>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products/accessories"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Accessories
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Complete your look with our stylish accessories.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <div className="md:col-span-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products/footwear"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Footwear
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Step out in style with our premium footwear
                            collection.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/new-arrivals" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    New Arrivals
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/sale" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Sale
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Search and Actions - Adjusted for better spacing */}
        <div className="flex flex-1 items-center justify-end gap-4 md:justify-end md:gap-6">
          {/* Search Bar - Made wider and positioned better */}
          <div className="hidden md:block md:w-[280px] lg:w-[320px] xl:w-[380px]">
            <SearchBar />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Search"
            onClick={() => setIsOpen(true)}
          >
            <SearchBar.Icon />
          </Button>

          {/* Cart with Badge */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
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
                <p className="text-center text-sm text-muted-foreground">
                  item in your cart
                </p>
                {/* Cart items would go here */}
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

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={isLoggedIn ? '/placeholder.svg' : undefined}
                    alt="User"
                  />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoggedIn ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        John Doe
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        john.doe@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsLoggedIn(false)}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2 p-2">
                    <Link href="/login" passHref>
                      <Button className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register" passHref>
                      <Button variant="outline" className="w-full">
                        Create Account
                      </Button>
                    </Link>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="cursor-pointer">
                      <span>Help Center</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search - Only visible when needed */}
      <div className="border-t md:hidden">
        <div className="container py-2">
          <SearchBar isMobile />
        </div>
      </div>
    </header>
  );
}
