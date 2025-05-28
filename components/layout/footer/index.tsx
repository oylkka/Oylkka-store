import {
  Banknote,
  CreditCardIcon as CardIcon,
  ChevronRight,
  Clock,
  CreditCard,
  Facebook,
  Gift,
  Globe,
  Headphones,
  Heart,
  Instagram,
  Mail,
  MapPin,
  PhoneCall,
  Send,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      />

      {/* Features Bar */}
      <div className="relative border-b border-zinc-800/40">
        <div className="container py-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-800/20 p-3 transition-all hover:bg-zinc-800/30">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-zinc-400">On orders over ৳2000</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-zinc-800/20 p-3 transition-all hover:bg-zinc-800/30">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-zinc-400">100% protected</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-zinc-800/20 p-3 transition-all hover:bg-zinc-800/30">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">24/7 Support</p>
                <p className="text-xs text-zinc-400">Dedicated assistance</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-zinc-800/20 p-3 transition-all hover:bg-zinc-800/30">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Special Offers</p>
                <p className="text-xs text-zinc-400">Save up to 25%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                <span className="text-primary">Oyl</span>kka
              </h1>
            </Link>

            <p className="mb-6 text-sm leading-relaxed text-zinc-400">
              Discover quality products at unbeatable prices. We&#39;re
              committed to providing exceptional shopping experiences with fast
              shipping, secure checkout, and premium customer support.
            </p>

            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-zinc-400 transition-colors hover:text-zinc-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                  <MapPin className="text-primary h-4 w-4" />
                </div>
                <span>123 Commerce St, Shopping City</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-400 transition-colors hover:text-zinc-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                  <PhoneCall className="text-primary h-4 w-4" />
                </div>
                <span>+1 (234) 567-8900</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-400 transition-colors hover:text-zinc-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                  <Mail className="text-primary h-4 w-4" />
                </div>
                <span>support@oylkka.com</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-400 transition-colors hover:text-zinc-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                  <Clock className="text-primary h-4 w-4" />
                </div>
                <span>Mon-Fri: 9AM - 6PM</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="mb-3 text-sm font-medium">Follow Us</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com/mookkly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:bg-primary flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-all hover:text-white"
                  aria-label="Facebook"
                >
                  <Facebook
                    size={18}
                    className="transition-transform group-hover:scale-110"
                  />
                </a>
                <a
                  href="https://instagram.com/mookkly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:bg-primary flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-all hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram
                    size={18}
                    className="transition-transform group-hover:scale-110"
                  />
                </a>
                <a
                  href="https://twitter.com/mookkly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:bg-primary flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-all hover:text-white"
                  aria-label="Twitter"
                >
                  <Twitter
                    size={18}
                    className="transition-transform group-hover:scale-110"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-5">
            {/* Shop Links */}
            <div>
              <h4 className="after:bg-primary/70 mb-6 text-lg font-semibold after:mt-2 after:block after:h-1 after:w-12 after:rounded-full">
                Shop
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/products"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offers"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    Special Offers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/new-arrivals"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bestsellers"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    Bestsellers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="after:bg-primary/70 mb-6 text-lg font-semibold after:mt-2 after:block after:h-1 after:w-12 after:rounded-full">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="group hover:text-primary flex items-center text-sm text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="mr-2 h-4 w-0 opacity-0 transition-all group-hover:w-4 group-hover:opacity-100" />
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="after:bg-primary/70 mb-6 text-lg font-semibold after:mt-2 after:block after:h-1 after:w-12 after:rounded-full">
              Stay Connected
            </h4>
            <p className="mb-6 text-sm text-zinc-400">
              Subscribe to our newsletter for exclusive deals, new arrivals, and
              insider updates.
            </p>

            <form className="mb-6">
              <div className="relative mb-3 overflow-hidden">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="h-12 pr-12"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute top-2 right-1"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Subscribe</span>
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                By subscribing, you agree to our{' '}
                <Link
                  href="/privacy-policy"
                  className="hover:text-primary text-zinc-400 underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
              </p>
            </form>

            {/* App Download */}
            <div className="rounded-xl bg-zinc-800/30 p-4">
              <h5 className="mb-3 text-sm font-medium">Download Our App</h5>
              <p className="mb-4 text-xs text-zinc-400">
                Shop on the go with our mobile app
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-zinc-700 bg-zinc-800/50 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.954 11.616L15.911 8.659L6.36 3.29C5.727 2.923 5.176 2.93 4.759 3.233L12.954 11.616Z"
                      fill="currentColor"
                    />
                    <path
                      d="M16.415 15.045L19.489 13.247C20.029 12.931 20.029 12.069 19.489 11.753L16.415 9.955L13.211 13.159L16.415 15.045Z"
                      fill="currentColor"
                    />
                    <path
                      d="M4.759 20.767C5.176 21.07 5.727 21.077 6.36 20.71L15.911 15.341L12.954 12.384L4.759 20.767Z"
                      fill="currentColor"
                    />
                    <path
                      d="M4.447 3.525C4.264 3.845 4.167 4.286 4.167 4.833V19.167C4.167 19.714 4.264 20.155 4.447 20.475L12.642 12.092L4.447 3.525Z"
                      fill="currentColor"
                    />
                  </svg>
                  Google Play
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-zinc-700 bg-zinc-800/50 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.741 19.356C16.082 20.0374 15.3137 19.9917 14.5714 19.7088C13.7943 19.4202 13.0743 19.4087 12.2514 19.7088C11.1943 20.0946 10.6514 19.9145 10.0629 19.356C6.97717 16.1231 7.56003 11.0802 11.1943 10.8831C12.1657 10.9345 12.8343 11.3774 13.3886 11.4231C14.2114 11.2373 14.9943 10.7831 15.8971 10.8545C17.0057 10.9545 17.8229 11.4288 18.3429 12.2802C15.5314 13.8802 16.1657 17.4574 18.7429 18.3888C18.3429 18.7545 17.9029 19.1088 17.4171 19.4659L16.741 19.356ZM12.9714 10.7717C12.8114 8.83452 14.3771 7.28595 16.1943 7.14309C16.4343 9.37167 14.1829 11.0002 12.9714 10.7717Z"
                      fill="currentColor"
                    />
                  </svg>
                  App Store
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-zinc-800/40 py-6">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Copyright */}
            <div className="flex items-center gap-2">
              <Heart className="text-primary h-4 w-4" />
              <p className="text-sm text-zinc-400">
                &copy; {new Date().getFullYear()} Oylkka. All rights reserved.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex h-10 items-center gap-2 rounded-lg bg-zinc-800/40 px-3 text-xs text-zinc-300">
                <Star className="text-primary h-4 w-4" />
                <span>Trusted Shop</span>
              </div>
              <div className="flex h-10 items-center gap-2 rounded-lg bg-zinc-800/40 px-3 text-xs text-zinc-300">
                <Globe className="text-primary h-4 w-4" />
                <span>Worldwide Shipping</span>
              </div>
              <div className="flex h-10 items-center gap-2 rounded-lg bg-zinc-800/40 px-3 text-xs text-zinc-300">
                <CardIcon className="text-primary h-4 w-4" />
                <span>Secure Checkout</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-12 items-center justify-center rounded bg-zinc-800/60 text-zinc-300 transition-colors hover:bg-zinc-800">
                <CreditCard size={16} />
              </div>
              <div className="flex h-8 w-12 items-center justify-center rounded bg-zinc-800/60 text-zinc-300 transition-colors hover:bg-zinc-800">
                <Banknote size={16} />
              </div>
              <div className="flex h-8 w-12 items-center justify-center rounded bg-zinc-800/60 text-zinc-300 transition-colors hover:bg-zinc-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0" />
                  <path d="M16.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0" />
                  <path d="M5 12h14" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
