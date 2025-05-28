'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { JSX, Suspense } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderConfirmation } from '@/services';

type CartItem = {
  id: string;
  name: string;
  variantName: string;
  quantity: number;
  price: number;
  image: {
    url: string;
  };
};

type ShippingAddress = {
  name: string;
  address1: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  email: string;
};

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  metadata: {
    cartData: CartItem[];
  };
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function OrderConfirmationContent(): JSX.Element {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '1';
  const { isPending, data, isError } = useOrderConfirmation({ id: orderId });

  if (isPending) {
    return <OrderSkeleton />;
  }
  if (isError || !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <XCircle className="mr-2 h-6 w-6" /> Something went wrong.
      </div>
    );
  }

  const order: Order = data.order;
  const { cartData: products } = order.metadata;
  const shipping = order.shippingAddress;

  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-6 px-4">
      <Card className="border border-green-500 shadow-xl">
        <CardHeader className="flex flex-col items-center text-center">
          <CheckCircle2 className="mb-2 h-12 w-12 text-green-600" />
          <CardTitle className="text-3xl font-semibold">
            Thank You, {shipping.name}!
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Your order has been placed successfully.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="grid grid-cols-2 gap-6">
            <InfoItem label="Order Number" value={order.orderNumber} />
            <InfoItem label="Date" value={formatDate(order.createdAt)} />
            <InfoItem
              label="Payment Status"
              value={
                <Badge
                  variant="outline"
                  className="border-green-500 text-green-700"
                >
                  {order.paymentStatus}
                </Badge>
              }
            />
            <InfoItem label="Payment Method" value={order.paymentMethod} />
          </div>

          <Separator />

          <div className="space-y-1">
            <SectionTitle>Shipping Address</SectionTitle>
            <p>{shipping.name}</p>
            <p>{shipping.address1}</p>
            <p>
              {shipping.city}, {shipping.district}, {shipping.postalCode}
            </p>
            <p>Phone: {shipping.phone}</p>
            <p>Email: {shipping.email}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            {products.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-md border p-4"
              >
                <Image
                  src={item.image.url}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md border"
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-muted-foreground">{item.variantName}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Total: ৳{item.price} BDT</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}): JSX.Element {
  return (
    <div>
      <p className="text-muted-foreground font-semibold">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <p className="text-muted-foreground font-semibold">{children}</p>;
}

function OrderSkeleton(): JSX.Element {
  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-6 px-4">
      <Card>
        <CardHeader>
          <Skeleton className="mx-auto mb-2 h-6 w-1/2" />
          <Skeleton className="mx-auto h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-md" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState(): JSX.Element {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="text-primary h-6 w-6 animate-spin" />
    </div>
  );
}

export default function OrderConfirmation(): JSX.Element {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
