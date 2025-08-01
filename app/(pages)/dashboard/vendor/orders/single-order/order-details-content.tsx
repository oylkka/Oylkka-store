'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import type { JSX } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type {
  CartItem,
  Order,
  OrderErrorStateProps,
  OrderStatus,
  OrderStatusBadgeProps,
} from '@/lib//types';
import { useSingleVendorOrder } from '@/services';

export default function OrderDetailsContent(): JSX.Element {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const { isPending, data, isError } = useSingleVendorOrder({ orderId });

  if (isPending) {
    return <OrderLoadingState />;
  }

  if (isError || !data) {
    return <OrderErrorState />;
  }

  const order: Order = data.order || data.json?.order;

  if (!order) {
    return <OrderErrorState message='Order data is missing or invalid' />;
  }

  const shippingAddress = order.shippingAddress;

  // Calculate order progress based on status
  const getOrderProgress = (): number => {
    const statuses: OrderStatus[] = [
      'PENDING',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
    ];
    const currentIndex = statuses.indexOf(order.status as OrderStatus);
    if (currentIndex === -1) {
      return 0;
    }
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  return (
    <div className='mx-auto max-w-4xl space-y-8 p-6'>
      {/* Header with gradient background */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white shadow-lg'>
        <div className='absolute inset-0 bg-white/10 backdrop-blur-sm' />
        <div className='relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <span className='inline-block rounded-md bg-white/20 px-2 py-1 text-xs font-medium backdrop-blur-sm'>
              {order.paymentMethod}
            </span>
            <h1 className='mt-2 text-3xl font-bold tracking-tight'>
              Order #{order.orderNumber}
            </h1>
            <p className='text-white/80'>
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <Button variant='secondary' size='sm' className='gap-2 font-medium'>
            <Download className='h-4 w-4' />
            Invoice
          </Button>
        </div>
      </div>

      {/* Order Progress */}
      <div className='bg-card rounded-xl border p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold'>Order Progress</h2>
        <Progress value={getOrderProgress()} className='mb-6 h-2' />

        <div className='grid grid-cols-4 gap-2 text-center'>
          <div
            className={`flex flex-col items-center ${order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div className='bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full'>
              <Clock className='h-5 w-5' />
            </div>
            <span className='text-xs font-medium'>Pending</span>
          </div>

          <div
            className={`flex flex-col items-center ${order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div className='bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full'>
              <Package className='h-5 w-5' />
            </div>
            <span className='text-xs font-medium'>Processing</span>
          </div>

          <div
            className={`flex flex-col items-center ${order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div className='bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full'>
              <Truck className='h-5 w-5' />
            </div>
            <span className='text-xs font-medium'>Shipped</span>
          </div>

          <div
            className={`flex flex-col items-center ${order.status === 'DELIVERED' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div className='bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full'>
              <CheckCircle2 className='h-5 w-5' />
            </div>
            <span className='text-xs font-medium'>Delivered</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {/* Order Details */}
        <Card className='overflow-hidden border-none pt-0 shadow-md md:col-span-2'>
          <div className='bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 dark:from-violet-950/20 dark:to-purple-950/20'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Package className='h-5 w-5' />
              Order Details
            </CardTitle>
          </div>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div className='bg-muted/30 space-y-4 rounded-lg p-4'>
                <h3 className='text-muted-foreground font-medium'>
                  Payment Information
                </h3>
                <div className='space-y-2'>
                  <div className='flex items-start gap-3'>
                    <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                      <CreditCard className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Method</p>
                      <p className='text-sm'>{order.paymentMethod}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                      <Clock className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Status</p>
                      <OrderStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                  {order.metadata?.bkashPaymentID && (
                    <div className='flex items-start gap-3'>
                      <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                        <ShoppingBag className='h-4 w-4' />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>Transaction ID</p>
                        <p className='font-mono text-sm'>
                          {order.metadata.bkashPaymentID}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className='bg-muted/30 space-y-4 rounded-lg p-4'>
                <h3 className='text-muted-foreground font-medium'>
                  Shipping Information
                </h3>
                <div className='space-y-2'>
                  <div className='flex items-start gap-3'>
                    <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                      <Truck className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Status</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                      <Clock className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Estimated Delivery</p>
                      <p className='text-sm'>
                        {order.estimatedDelivery
                          ? new Date(
                              order.estimatedDelivery,
                            ).toLocaleDateString()
                          : 'Not scheduled yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className='overflow-hidden border-none pt-0 shadow-md'>
          <div className='bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 dark:from-violet-950/20 dark:to-purple-950/20'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CreditCard className='h-5 w-5' />
              Order Summary
            </CardTitle>
          </div>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              <div className='flex justify-between'>
                <p className='text-muted-foreground text-sm'>Subtotal</p>
                <p className='font-medium'>
                  {order.subtotal} {order.currency}
                </p>
              </div>
              <div className='flex justify-between'>
                <p className='text-muted-foreground text-sm'>Shipping</p>
                <p className='font-medium'>
                  {order.shipping} {order.currency}
                </p>
              </div>
              <div className='flex justify-between'>
                <p className='text-muted-foreground text-sm'>Tax</p>
                <p className='font-medium'>
                  {order.tax} {order.currency}
                </p>
              </div>
              {order.discount > 0 && (
                <div className='flex justify-between'>
                  <p className='text-muted-foreground text-sm'>Discount</p>
                  <p className='font-medium text-green-600'>
                    -{order.discount} {order.currency}
                  </p>
                </div>
              )}
              <Separator />
              <div className='flex justify-between'>
                <p className='font-medium'>Total</p>
                <p className='text-primary text-xl font-bold'>
                  {order.total} {order.currency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card className='overflow-hidden border-none pt-0 shadow-md'>
        <div className='bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 dark:from-violet-950/20 dark:to-purple-950/20'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <ShoppingBag className='h-5 w-5' />
              Items
            </CardTitle>
            <Badge variant='secondary' className='rounded-full px-3'>
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </div>
        <CardContent className='p-6'>
          <div className='space-y-6'>
            {order.items.map((item: CartItem) => (
              <div
                key={item.id}
                className='group hover:bg-muted/50 flex flex-col items-start gap-6 rounded-lg p-4 transition-colors sm:flex-row'
              >
                <div className='bg-muted relative h-24 w-24 overflow-hidden rounded-lg'>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className='object-cover transition-transform group-hover:scale-105'
                      sizes='96px'
                    />
                  ) : (
                    <div className='bg-secondary flex h-full w-full items-center justify-center'>
                      <ShoppingBag className='text-muted-foreground h-8 w-8' />
                    </div>
                  )}
                </div>
                <div className='flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='space-y-1'>
                    <h3 className='text-lg font-medium'>{item.productName}</h3>
                    {item.variantInfo.variantName && (
                      <p className='text-muted-foreground text-sm'>
                        {item.variantInfo.variantName}
                      </p>
                    )}
                    <p className='text-sm'>Qty: {item.quantity}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-primary text-lg font-bold'>
                      {item.price} {order.currency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card className='overflow-hidden border-none pt-0 shadow-md'>
        <div className='bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 dark:from-violet-950/20 dark:to-purple-950/20'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <MapPin className='h-5 w-5' />
            Shipping Address
          </CardTitle>
        </div>
        <CardContent className='p-6'>
          {shippingAddress ? (
            <div className='flex flex-col gap-6 sm:flex-row'>
              <div className='flex-1 space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                    <MapPin className='h-4 w-4' />
                  </div>
                  <div className='space-y-1'>
                    <p className='font-medium'>{shippingAddress.name}</p>
                    <p className='text-sm'>{shippingAddress.address1}</p>
                    {shippingAddress.address2 && (
                      <p className='text-sm'>{shippingAddress.address2}</p>
                    )}
                    <p className='text-sm'>
                      {shippingAddress.city}, {shippingAddress.district}{' '}
                      {shippingAddress.postalCode}
                    </p>
                    <p className='text-sm'>{shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              <div className='flex-1 space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                    <Phone className='h-4 w-4' />
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Phone</p>
                    <p className='text-sm'>{shippingAddress.phone}</p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                    <Mail className='h-4 w-4' />
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Email</p>
                    <p className='text-sm'>{shippingAddress.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground'>
              No shipping address provided
            </p>
          )}
        </CardContent>
      </Card>

      {order.notes && (
        <Card className='overflow-hidden border-none pt-0 shadow-md'>
          <div className='bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 dark:from-violet-950/20 dark:to-purple-950/20'>
            <CardTitle className='text-lg'>Order Notes</CardTitle>
          </div>
          <CardContent className='p-6'>
            <p>{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: OrderStatusBadgeProps): JSX.Element {
  const statusConfig: Record<
    string,
    { variant: string; label: string; className: string }
  > = {
    PENDING: {
      variant: 'warning',
      label: 'Pending',
      className:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500',
    },
    PROCESSING: {
      variant: 'info',
      label: 'Processing',
      className:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
    },
    SHIPPED: {
      variant: 'default',
      label: 'Shipped',
      className:
        'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-500',
    },
    DELIVERED: {
      variant: 'success',
      label: 'Delivered',
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
    },
    CANCELLED: {
      variant: 'destructive',
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
    },
    PAID: {
      variant: 'success',
      label: 'Paid',
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
    },
    FAILED: {
      variant: 'destructive',
      label: 'Failed',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
    },
    REFUNDED: {
      variant: 'warning',
      label: 'Refunded',
      className:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500',
    },
  };

  const config = statusConfig[status] || {
    variant: 'outline',
    label: status,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function OrderLoadingState(): JSX.Element {
  return (
    <div className='mx-auto flex h-[70vh] max-w-4xl items-center justify-center p-8'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative h-16 w-16'>
          <div className='absolute inset-0 h-full w-full animate-spin rounded-full border-4 border-violet-200 border-t-violet-600' />
          <div className='absolute inset-2 h-12 w-12 animate-ping rounded-full bg-violet-400/20' />
        </div>
        <p className='text-lg font-medium text-violet-700 dark:text-violet-300'>
          Loading order details...
        </p>
      </div>
    </div>
  );
}

function OrderErrorState({
  message = 'Error loading order details. Please try again.',
}: OrderErrorStateProps): JSX.Element {
  return (
    <div className='mx-auto max-w-4xl p-8'>
      <Alert
        variant='destructive'
        className='border-none bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
      >
        <AlertCircle className='h-5 w-5' />
        <AlertTitle className='text-lg font-semibold'>Error</AlertTitle>
        <AlertDescription className='mt-2'>{message}</AlertDescription>
        <Button
          variant='outline'
          className='mt-4 border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900/30'
        >
          Try Again
        </Button>
      </Alert>
    </div>
  );
}
