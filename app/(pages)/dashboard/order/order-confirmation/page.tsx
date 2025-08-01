'use client';

import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { type JSX, Suspense } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderConfirmation } from '@/services';

type OrderItem = {
  id: string;
  productName: string;
  variantInfo: {
    variantId: string | null;
    variantName: string;
    variantSku: string;
  } | null;
  quantity: number;
  price: number;
  discount: number;
  image: string;
  status: string;
};

type ShippingAddress = {
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  district: string;
  state: string | null;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatCurrency(amount: number, currency = 'BDT'): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function getStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'processing':
    case 'confirmed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
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
      <div className='flex h-[50vh] items-center justify-center text-red-500'>
        <XCircle className='mr-2 h-6 w-6' /> Something went wrong.
      </div>
    );
  }

  const order: Order = data.order;
  const shipping = order.shippingAddress;

  return (
    <div className='from-muted/30 to-muted/60 min-h-screen bg-gradient-to-br py-8'>
      <div className='mx-auto max-w-4xl px-4'>
        {/* Success Header */}
        <div className='mb-8 text-center'>
          <div className='bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full'>
            <CheckCircle2 className='text-primary h-8 w-8' />
          </div>
          <h1 className='mb-2 text-3xl font-bold'>Order Confirmed!</h1>
          <p className='text-muted-foreground'>
            Thank you for your purchase. Your order has been successfully
            placed.
          </p>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Order Details */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Order Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='h-5 w-5' />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <InfoItem
                    label='Order Number'
                    value={
                      <span className='font-mono font-semibold'>
                        #{order.orderNumber}
                      </span>
                    }
                  />
                  <InfoItem
                    label='Order Date'
                    value={formatDate(order.createdAt)}
                  />
                  <InfoItem
                    label='Order Status'
                    value={
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    }
                  />
                  <InfoItem
                    label='Payment Status'
                    value={
                      <Badge variant={getStatusVariant(order.paymentStatus)}>
                        {order.paymentStatus.replace('_', ' ')}
                      </Badge>
                    }
                  />
                  <InfoItem
                    label='Payment Method'
                    value={
                      <div className='flex items-center gap-2'>
                        <CreditCard className='h-4 w-4' />
                        {order.paymentMethod.replace('_', ' ')}
                      </div>
                    }
                  />
                  <InfoItem label='Currency' value={order.currency} />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <div className='flex items-center gap-4'>
                        <div className='bg-muted relative h-16 w-16 overflow-hidden rounded-lg'>
                          <Image
                            src={
                              item.image ||
                              '/placeholder.svg?height=64&width=64'
                            }
                            alt={item.productName}
                            fill
                            className='object-cover'
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h3 className='truncate font-medium'>
                            {item.productName}
                          </h3>
                          {item.variantInfo && (
                            <p className='text-muted-foreground text-sm'>
                              {item.variantInfo.variantName}
                            </p>
                          )}
                          <div className='mt-1 flex items-center gap-4'>
                            <span className='text-muted-foreground text-sm'>
                              Qty: {item.quantity}
                            </span>
                            <span className='font-semibold'>
                              {formatCurrency(item.price, order.currency)}
                            </span>
                            {item.discount > 0 && (
                              <Badge variant='secondary' className='text-xs'>
                                -{formatCurrency(item.discount, order.currency)}{' '}
                                off
                              </Badge>
                            )}
                          </div>
                          <Badge variant='outline' className='mt-1 text-xs'>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold'>
                            {formatCurrency(
                              (item.price - item.discount) * item.quantity,
                              order.currency,
                            )}
                          </p>
                        </div>
                      </div>
                      {index < order.items.length - 1 && (
                        <Separator className='mt-4' />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm'>
                  <p className='font-semibold'>{shipping.name}</p>
                  <p className='text-muted-foreground'>{shipping.address1}</p>
                  {shipping.address2 && (
                    <p className='text-muted-foreground'>{shipping.address2}</p>
                  )}
                  <p className='text-muted-foreground'>
                    {shipping.city}, {shipping.district}
                  </p>
                  <p className='text-muted-foreground'>
                    {shipping.country} {shipping.postalCode}
                  </p>
                  <Separator className='my-3' />
                  <div className='space-y-1'>
                    <p className='text-muted-foreground'>
                      Phone: {shipping.phone}
                    </p>
                    <p className='text-muted-foreground'>
                      Email: {shipping.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Subtotal</span>
                    <span>
                      {formatCurrency(order.subtotal, order.currency)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Discount</span>
                      <span className='text-primary'>
                        -{formatCurrency(order.discount, order.currency)}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Shipping</span>
                    <span>
                      {formatCurrency(order.shipping, order.currency)}
                    </span>
                  </div>
                  {order.tax > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Tax</span>
                      <span>{formatCurrency(order.tax, order.currency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className='flex justify-between text-lg font-semibold'>
                    <span>Total</span>
                    <span>{formatCurrency(order.total, order.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  Estimated Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground mb-2 text-sm'>
                  Your order will be delivered within
                </p>
                <p className='text-lg font-semibold'>5-7 business days</p>
                <p className='text-muted-foreground mt-2 text-xs'>
                  You&#39;ll receive a tracking number via email once your order
                  ships.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Message */}
        <div className='mt-8 text-center'>
          <Card className='bg-primary/5 border-primary/20'>
            <CardContent className='pt-6'>
              <p className='mb-2 font-medium'>Need help with your order?</p>
              <p className='text-muted-foreground text-sm'>
                Contact our support team at support@oylkka.com or call
                +880-123-456-789
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
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
      <p className='text-muted-foreground mb-1 text-sm font-semibold'>
        {label}
      </p>
      <div>{value}</div>
    </div>
  );
}

function OrderSkeleton(): JSX.Element {
  return (
    <div className='from-muted/30 to-muted/60 min-h-screen bg-gradient-to-br py-8'>
      <div className='mx-auto max-w-4xl px-4'>
        {/* Success Header Skeleton */}
        <div className='mb-8 text-center'>
          <Skeleton className='mb-4 inline-block h-16 w-16 rounded-full' />
          <Skeleton className='mx-auto mb-2 h-8 w-64' />
          <Skeleton className='mx-auto h-4 w-96' />
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Content Skeleton */}
          <div className='space-y-6 lg:col-span-2'>
            <Card>
              <CardHeader>
                <Skeleton className='h-6 w-32' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    //  biome-ignore lint: error
                    <div key={i} className='space-y-2'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className='h-6 w-32' />
              </CardHeader>
              <CardContent className='space-y-4'>
                {Array.from({ length: 3 }).map((_, i) => (
                  //  biome-ignore lint: error
                  <div key={i} className='flex items-center gap-4'>
                    <Skeleton className='h-16 w-16 rounded-lg' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-48' />
                      <Skeleton className='h-3 w-32' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                    <Skeleton className='h-4 w-16' />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className='space-y-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              //  biome-ignore lint: error
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-6 w-32' />
                </CardHeader>
                <CardContent className='space-y-2'>
                  {Array.from({ length: 4 }).map((_, j) => (
                    //  biome-ignore lint: error
                    <Skeleton key={j} className='h-4 w-full' />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState(): JSX.Element {
  return (
    <div className='flex h-[50vh] items-center justify-center'>
      <Loader2 className='text-primary h-6 w-6 animate-spin' />
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
