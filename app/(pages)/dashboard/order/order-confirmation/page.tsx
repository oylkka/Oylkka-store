'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderConfirmation } from '@/service/order';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '1';
  const { isPending, data, isError } = useOrderConfirmation({ id: orderId });

  if (isPending) {
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

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <XCircle className="mr-2 h-6 w-6" /> Something went wrong.
      </div>
    );
  }

  const order = data.order;
  const product = order.metadata.cartData[0];
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground font-semibold">
                Order Number
              </p>
              <p>{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">Date</p>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">
                Payment Status
              </p>
              <Badge
                variant="outline"
                className="border-green-500 text-green-700"
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">
                Payment Method
              </p>
              <p>{order.paymentMethod}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground font-semibold">
              Shipping Address
            </p>
            <p>{shipping.name}</p>
            <p>{shipping.address1}</p>
            <p>
              {shipping.city}, {shipping.district}, {shipping.postalCode}
            </p>
            <p>Phone: {shipping.phone}</p>
            <p>Email: {shipping.email}</p>
          </div>

          <Separator />

          <div className="flex items-center gap-4">
            <Image
              src={product.imageUrl}
              alt={product.productName}
              width={80}
              height={80}
              className="rounded-md border"
            />
            <div className="text-sm">
              <p className="font-semibold">{product.productName}</p>
              <p>Quantity: {product.quantity}</p>
              <p>Total: ৳{order.total} BDT</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="text-primary h-6 w-6 animate-spin" />
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
