import {
  Banknote,
  CreditCard,
  Facebook,
  Instagram,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-100">
      <div className="container mx-auto grid grid-cols-1 gap-12 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="text-primary h-6 w-6" />
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              <span className="text-primary">Oyl</span>kka
            </h1>
          </Link>
          <p className="mb-6 text-sm leading-relaxed text-zinc-400">
            Discover quality products at unbeatable prices. Fast shipping,
            secure checkout, and premium support.
          </p>
          <div className="flex items-center gap-4 text-zinc-400">
            <Truck className="h-5 w-5" />
            <ShieldCheck className="h-5 w-5" />
            <PhoneCall className="h-5 w-5" />
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-2">
          {/* Shop Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link
                  href="/products"
                  className="transition hover:text-zinc-100"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="transition hover:text-zinc-100"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/offers" className="transition hover:text-zinc-100">
                  Special Offers
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition hover:text-zinc-100">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/about" className="transition hover:text-zinc-100">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-zinc-100"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="transition hover:text-zinc-100"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-zinc-100">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="mb-4 text-lg font-semibold">Stay in the Loop</h4>
          <p className="mb-4 text-sm text-zinc-400">
            Subscribe for exclusive deals and updates.
          </p>
          <form className="flex w-full items-center space-x-2">
            <Input
              type="email"
              placeholder="Your email"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
            <Button
              type="submit"
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-10 border-t border-zinc-800" />

      {/* Bottom Bar */}
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row">
        {/* Socials */}
        <div className="flex items-center gap-4 text-zinc-400">
          <a
            href="https://facebook.com/mookkly"
            target="_blank"
            className="transition hover:text-white"
          >
            <Facebook size={18} />
          </a>
          <a
            href="https://instagram.com/mookkly"
            target="_blank"
            className="transition hover:text-white"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://twitter.com/mookkly"
            target="_blank"
            className="transition hover:text-white"
          >
            <Twitter size={18} />
          </a>
        </div>

        {/* Payment icons */}
        <div className="flex items-center gap-4 text-zinc-400">
          <CreditCard size={22} />

          <Banknote size={22} />
        </div>

        {/* Copyright */}
        <p className="text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} BestStore. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
