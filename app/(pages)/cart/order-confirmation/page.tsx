import { Check, Home, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function OrderConfirmationPage() {
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
          <Check className="text-primary h-10 w-10" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Thank You for Your Order!</h1>
        <p className="text-muted-foreground">
          Your order has been received and is now being processed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Confirmation</CardTitle>
          <CardDescription>Order #{orderNumber}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-md font-medium">Order Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p>April 21, 2025</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p>Credit Card (ending in 3456)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shipping Method</p>
                <p>Priority Shipping (2-3 business days)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expected Delivery</p>
                <p>April 24-25, 2025</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-md font-medium">Shipping Address</h3>
            <div className="text-sm">
              <p>John Doe</p>
              <p>123 Main Street, Apt 4B</p>
              <p>New York, NY 10001</p>
              <p>United States</p>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-md font-medium">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src="/api/placeholder/100/100"
                    alt="Premium Wireless Headphones"
                    className="h-full w-full object-cover"
                    height={100}
                    width={100}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">
                    Premium Wireless Headphones
                  </h4>
                  <p className="text-muted-foreground text-sm">Qty: 1</p>
                </div>
                <div className="text-sm font-medium">$199.99</div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src="/api/placeholder/100/100"
                    alt="Smart Watch Pro"
                    className="h-full w-full object-cover"
                    height={100}
                    width={100}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Smart Watch Pro</h4>
                  <p className="text-muted-foreground text-sm">Qty: 1</p>
                </div>
                <div className="text-sm font-medium">$299.95</div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>$499.94</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>$8.99</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>$35.00</span>
              </div>
              <div className="flex justify-between pt-2 font-medium">
                <span>Total</span>
                <span>$543.93</span>
              </div>
            </div>
          </div>

          <div className="bg-muted space-y-2 rounded-md p-4">
            <div className="flex">
              <Package className="text-muted-foreground mr-2 h-5 w-5" />
              <div>
                <h4 className="text-sm font-medium">Shipping Updates</h4>
                <p className="text-muted-foreground text-xs">
                  You will receive shipping updates and tracking information via
                  email.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-muted-foreground text-center text-sm">
            If you have any questions about your order, please contact our
            customer service team.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
            <Button className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Track Order
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-10 text-center">
        <h2 className="mb-4 text-xl font-semibold">You Might Also Like</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              name: 'Bluetooth Speaker',
              price: 79.99,
              image: '/api/placeholder/200/200',
            },
            {
              name: 'Wireless Charger',
              price: 49.99,
              image: '/api/placeholder/200/200',
            },
            {
              name: 'Phone Stand',
              price: 19.99,
              image: '/api/placeholder/200/200',
            },
          ].map((product, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  height={200}
                  width={200}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-muted-foreground text-sm">
                  ${product.price}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full">
                  View Product
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// types/index.ts
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type OrderSummary = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export type ShippingMethod = 'standard' | 'priority' | 'express';

export type CheckoutStep = 'information' | 'shipping' | 'payment' | 'review';

export type AddressData = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  phone: string;
};

export type PaymentData = {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
};
