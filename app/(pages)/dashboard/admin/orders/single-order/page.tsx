'use client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignleOrderInfo } from '@/service';

function OrderDetailsContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const { isPending, data, isError } = useSignleOrderInfo({ orderId });

  if (isPending) {
    return <div>Loading...</div>;
  }
  if (isError || !data) {
    return <div>Error loading order.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Order #{data.orderNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              Status: <span className="font-medium">{data.status}</span>
            </p>
            <p>
              Payment:{' '}
              <span className="font-medium">
                {data.paymentStatus} ({data.paymentMethod})
              </span>
            </p>
            <p>
              Total:{' '}
              <span className="font-semibold">
                {data.total} {data.currency}
              </span>
            </p>
            <p>
              Tracking:{' '}
              <span>{data.metadata?.bkashTransactionId || 'N/A'}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Info</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar>
            <Image
              src={data.user.image}
              alt={data.user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          </Avatar>
          <div>
            <p>{data.user.name}</p>
            <p className="text-muted-foreground text-sm">{data.user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{data.shippingAddress.name}</p>
          <p>
            {data.shippingAddress.address1}, {data.shippingAddress.city},{' '}
            {data.shippingAddress.district}
          </p>
          <p>{data.shippingAddress.postalCode}</p>
          <p>Phone: {data.shippingAddress.phone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {data.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4"
            >
              {/* <Image
                src={item.imageUrl}
                alt={item.productName}
                width={50}
                height={50}
                className="rounded-md"
              /> */}
              <div className="flex-1">
                <p>{item.productName}</p>
                <p className="text-muted-foreground text-sm">
                  Qty: {item.quantity}
                </p>
              </div>
              <div>
                <p className="font-semibold">
                  {item.price} {data.currency}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderDetails() {
  return (
    <Suspense fallback="Loading">
      <OrderDetailsContent />
    </Suspense>
  );
}
