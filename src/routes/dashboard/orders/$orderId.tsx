import { createFileRoute, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ChevronLeft, Package } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderDetail } from '@/services/order';

const statusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { variant: 'secondary' as const, className: '', label: 'Pending' };
    case 'CONFIRMED':
      return { variant: 'default' as const, className: '', label: 'Confirmed' };
    case 'PROCESSING':
      return {
        variant: 'outline' as const,
        className: '',
        label: 'Processing',
      };
    case 'SHIPPED':
      return {
        variant: 'default' as const,
        className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        label: 'Shipped',
      };
    case 'DELIVERED':
      return { variant: 'default' as const, className: '', label: 'Delivered' };
    case 'CANCELLED':
      return {
        variant: 'destructive' as const,
        className: '',
        label: 'Cancelled',
      };
    case 'REFUNDED':
      return { variant: 'outline' as const, className: '', label: 'Refunded' };
    default:
      return { variant: 'outline' as const, className: '', label: status };
  }
};

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
] as const;

const STEP_ORDER = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

function getActiveStepIndex(status: string): number {
  if (status === 'CANCELLED' || status === 'REFUNDED') return -1;
  const idx = STEP_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export const Route = createFileRoute('/dashboard/orders/$orderId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-48 rounded-2xl' />
        <Skeleton className='h-64 rounded-2xl' />
        <Skeleton className='h-40 rounded-2xl' />
      </div>
    );
  }

  if (!order) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
          <Package className='w-7 h-7 text-muted-foreground' />
        </div>
        <div>
          <p className='text-sm font-semibold'>Order not found</p>
          <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
            This order doesn't exist or you don't have access to it.
          </p>
        </div>
        <Button size='sm' asChild className='mt-2'>
          <Link to='/dashboard/orders'>Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const {
    variant: sVariant,
    className: sClass,
    label: sLabel,
  } = statusBadge(order.status);
  const activeStep = getActiveStepIndex(order.status);
  const isTerminal =
    order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div className='space-y-6'>
      <Button
        variant='ghost'
        size='sm'
        asChild
        className='gap-1.5 text-muted-foreground -ml-2'
      >
        <Link to='/dashboard/orders'>
          <ChevronLeft className='w-4 h-4' />
          Back to Orders
        </Link>
      </Button>

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>
            {order.orderNumber}
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <Badge
          variant={sVariant}
          className={`text-[10px] uppercase tracking-wider w-fit ${sClass}`}
        >
          {sLabel}
        </Badge>
      </div>

      {/* Status timeline */}
      {!isTerminal && (
        <div className='rounded-2xl border border-border bg-card p-5'>
          <div className='flex items-center gap-0'>
            {ORDER_STEPS.map((step, i) => {
              const isActive = i <= activeStep;
              const isCurrent = i === activeStep;
              return (
                <div key={step.key} className='flex items-center flex-1'>
                  <div className='flex flex-col items-center gap-1.5'>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-card' : ''}`}
                    >
                      {isActive ? '✓' : i + 1}
                    </div>
                    <span
                      className={`text-[10px] font-medium whitespace-nowrap ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < ORDER_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-2 mt-[-1.25rem] ${
                        i < activeStep ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isTerminal && (
        <div className='rounded-2xl border border-border bg-card p-5'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0'>
              <Package className='w-5 h-5 text-destructive' />
            </div>
            <div>
              <p className='text-sm font-semibold'>
                {order.status === 'CANCELLED'
                  ? 'Order Cancelled'
                  : 'Order Refunded'}
              </p>
              {order.cancellationReason && (
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Reason: {order.cancellationReason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order items */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            Items ({order.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-0'>
          {order.items.map((item) => (
            <div
              key={item.id}
              className='flex items-start gap-4 py-4 border-b border-border last:border-0'
            >
              <div className='relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0'>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className='object-cover w-full h-full'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Package className='w-5 h-5 text-muted-foreground' />
                  </div>
                )}
              </div>

              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold line-clamp-1'>
                  {item.productName}
                </p>
                {item.variantName && (
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {item.variantName}
                  </p>
                )}
                <div className='flex items-center justify-between mt-2'>
                  <span className='text-xs text-muted-foreground'>
                    Qty: {item.quantity}
                  </span>
                  <span className='text-sm font-bold tabular-nums'>
                    ৳{item.total.toLocaleString('en-BD')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Shipping info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className='space-y-1.5 text-sm'>
          <p className='font-medium'>{order.shippingName}</p>
          <p className='text-muted-foreground'>{order.shippingEmail}</p>
          <p className='text-muted-foreground'>{order.shippingPhone}</p>
          <p className='text-muted-foreground'>
            {order.shippingAddress}
            {order.shippingUpzila && `, ${order.shippingUpzila}`}
            {order.shippingDistrict && `, ${order.shippingDistrict}`}
            {order.shippingPostalCode && ` - ${order.shippingPostalCode}`}
          </p>
          {order.shippingComment && (
            <p className='text-muted-foreground italic mt-2'>
              Note: {order.shippingComment}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment summary */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Subtotal</span>
            <span className='tabular-nums'>
              ৳{order.subtotal.toLocaleString('en-BD')}
            </span>
          </div>
          {order.discountAmount > 0 && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Discount</span>
              <span className='tabular-nums text-destructive'>
                -৳{order.discountAmount.toLocaleString('en-BD')}
              </span>
            </div>
          )}
          {order.couponDiscount && order.couponDiscount > 0 && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Coupon Discount</span>
              <span className='tabular-nums text-destructive'>
                -৳{order.couponDiscount.toLocaleString('en-BD')}
              </span>
            </div>
          )}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Shipping</span>
            <span className='tabular-nums'>
              {order.shippingCost > 0
                ? `৳${order.shippingCost.toLocaleString('en-BD')}`
                : 'Free'}
            </span>
          </div>
          <div className='border-t border-border pt-3 flex items-center justify-between font-bold'>
            <span>Total</span>
            <span className='tabular-nums text-base'>
              ৳{order.total.toLocaleString('en-BD')}
            </span>
          </div>

          <div className='flex items-center gap-2 pt-2'>
            <span className='text-xs text-muted-foreground'>Payment:</span>
            <Badge
              variant='secondary'
              className='text-[10px] uppercase tracking-wider'
            >
              {order.paymentMethod ?? 'N/A'}
            </Badge>
            <Badge
              variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}
              className='text-[10px] uppercase tracking-wider'
            >
              {order.paymentStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
