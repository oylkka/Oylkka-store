import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { format } from 'date-fns';
import { Ban, ChevronLeft, Loader2, Package, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { OrderItemsTable } from '@/components/orders/order-items-table';
import { StatusBadge } from '@/components/orders/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useAdminCancelOrderMutation,
  useAdminFulfillMutation,
  useAdminOrderDetail,
  useAdminRefundMutation,
} from '@/services/admin-orders';

export const Route = createFileRoute('/dashboard/admin/orders/$orderId')({
  beforeLoad: ({ context }) => {
    if (
      !context.user?.role ||
      (context.user.role !== 'ADMIN' && context.user.role !== 'MANAGER')
    ) {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading } = useAdminOrderDetail(orderId);
  const fulfillMutation = useAdminFulfillMutation(orderId);
  const cancelMutation = useAdminCancelOrderMutation();
  const refundMutation = useAdminRefundMutation();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const isTerminalOrder =
    order?.status === 'CANCELLED' ||
    order?.status === 'REFUNDED' ||
    order?.status === 'DELIVERED';

  const handleCancel = () => {
    if (!cancelReason.trim()) return;
    cancelMutation.mutate(
      { orderId, reason: cancelReason.trim() },
      {
        onSuccess: () => {
          setCancelOpen(false);
          setCancelReason('');
        },
      },
    );
  };

  const handleRefund = () => {
    const amount = Number.parseFloat(refundAmount);
    if (!amount || amount <= 0 || !refundReason.trim()) return;
    refundMutation.mutate(
      { orderId, amount, reason: refundReason.trim() },
      {
        onSuccess: () => {
          setRefundOpen(false);
          setRefundAmount('');
          setRefundReason('');
        },
      },
    );
  };

  const handleFulfill = (
    itemId: string,
    fulfillmentStatus: string,
    trackingNumber?: string,
    trackingUrl?: string,
  ) => {
    fulfillMutation.mutate({
      itemId,
      fulfillmentStatus,
      trackingNumber,
      trackingUrl,
    });
  };

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
          <Link to='/dashboard/admin/orders'>Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const refundable =
    order.paymentStatus === 'PAID' ||
    order.paymentStatus === 'PARTIALLY_REFUNDED';

  return (
    <div className='space-y-6'>
      <Button
        variant='ghost'
        size='sm'
        asChild
        className='gap-1.5 text-muted-foreground -ml-2'
      >
        <Link to='/dashboard/admin/orders'>
          <ChevronLeft className='w-4 h-4' />
          Back to Orders
        </Link>
      </Button>

      {/* Order header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>
            {order.orderNumber}
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          <StatusBadge type='payment' value={order.paymentStatus} />
          <StatusBadge type='order' value={order.status} />
          {order.paymentMethod && (
            <Badge
              variant='secondary'
              className='text-[10px] uppercase tracking-wider'
            >
              {order.paymentMethod}
            </Badge>
          )}
        </div>
      </div>

      {/* Customer & Shipping */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Customer & Shipping</CardTitle>
        </CardHeader>
        <CardContent className='space-y-1.5 text-sm'>
          <p className='font-medium'>{order.customerName}</p>
          <p className='text-muted-foreground'>{order.customerEmail}</p>
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

      {/* Items */}
      <OrderItemsTable
        items={order.items}
        showShop
        allowOverride
        onFulfill={handleFulfill}
        isFulfilling={fulfillMutation.isPending}
      />

      {/* Payment Summary */}
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
              <span className='tabular-nums text-green-600'>
                -৳{order.discountAmount.toLocaleString('en-BD')}
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
          {order.couponCode && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                Coupon ({order.couponCode})
              </span>
              <span className='tabular-nums text-green-600'>
                -৳{(order.couponDiscount ?? 0).toLocaleString('en-BD')}
              </span>
            </div>
          )}
          <div className='border-t border-border pt-3 flex items-center justify-between font-bold'>
            <span>Total</span>
            <span className='tabular-nums text-base'>
              ৳{order.total.toLocaleString('en-BD')}
            </span>
          </div>

          {order.refundAmount != null && order.refundAmount > 0 && (
            <div className='rounded-xl bg-destructive/5 border border-destructive/20 p-3 space-y-1'>
              <p className='text-xs font-semibold text-destructive'>Refunded</p>
              <p className='text-sm'>
                ৳{order.refundAmount.toLocaleString('en-BD')}
                {order.refundReason && ` — ${order.refundReason}`}
              </p>
              {order.refundedAt && (
                <p className='text-xs text-muted-foreground'>
                  {format(new Date(order.refundedAt), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          )}

          {/* Payment details */}
          <div className='border-t border-border pt-3 space-y-1'>
            <p className='text-xs font-semibold text-muted-foreground'>
              Payment Details
            </p>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground'>Method:</span>
              <Badge
                variant='secondary'
                className='text-[10px] uppercase tracking-wider'
              >
                {order.paymentMethod ?? 'N/A'}
              </Badge>
            </div>
            {order.bkashPaymentID && (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>
                  bKash Payment ID:
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <code className='text-xs bg-muted px-1.5 py-0.5 rounded cursor-help'>
                        {order.bkashPaymentID.slice(0, 16)}...
                      </code>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-xs font-mono break-all'>
                        {order.bkashPaymentID}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {order.bkashTrxID && (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>
                  bKash TrxID:
                </span>
                <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>
                  {order.bkashTrxID}
                </code>
              </div>
            )}
            {order.paymentRef && !order.bkashTrxID && (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>Ref:</span>
                <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>
                  {order.paymentRef}
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex items-center gap-3 pb-6'>
        {!isTerminalOrder && (
          <Button
            variant='outline'
            className='gap-2'
            onClick={() => setCancelOpen(true)}
            disabled={cancelMutation.isPending}
          >
            <Ban className='w-4 h-4' />
            Cancel Order
          </Button>
        )}

        {refundable && (
          <Button
            variant='outline'
            className='gap-2 text-destructive hover:text-destructive'
            onClick={() => {
              setRefundAmount(String(order.total));
              setRefundReason('');
              setRefundOpen(true);
            }}
            disabled={refundMutation.isPending}
          >
            <RotateCcw className='w-4 h-4' />
            Process Refund
          </Button>
        )}

        {order.cancellationReason && (
          <div className='rounded-xl bg-destructive/5 border border-destructive/20 p-3'>
            <p className='text-xs font-semibold text-destructive'>
              Cancelled by{' '}
              {order.cancelledBy === order.customerId ? 'customer' : 'admin'}
            </p>
            <p className='text-sm mt-0.5'>{order.cancellationReason}</p>
            {order.cancelledAt && (
              <p className='text-xs text-muted-foreground mt-1'>
                {format(new Date(order.cancelledAt), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              This will cancel the entire order and mark all items as cancelled.
            </DialogDescription>
          </DialogHeader>
          <div className='py-2'>
            <Input
              placeholder='Reason for cancellation...'
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCancelOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleCancel}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancel'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund dialog */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              This will process a refund of the specified amount. For bKash
              payments, the refund will be sent back to the customer's bKash
              account.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <label htmlFor='refund-amount' className='text-sm font-medium'>
                Refund Amount (max ৳
                {(
                  (order.total ?? 0) - (order.refundAmount ?? 0)
                ).toLocaleString('en-BD')}
                )
              </label>
              <Input
                id='refund-amount'
                type='number'
                step='0.01'
                max={order.total - (order.refundAmount ?? 0)}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='refund-reason' className='text-sm font-medium'>
                Reason <span className='text-destructive'>*</span>
              </label>
              <Input
                id='refund-reason'
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder='e.g. Customer requested cancellation'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setRefundOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleRefund}
              disabled={
                !Number.parseFloat(refundAmount) ||
                Number.parseFloat(refundAmount) <= 0 ||
                !refundReason.trim() ||
                refundMutation.isPending
              }
            >
              {refundMutation.isPending ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  Refunding...
                </>
              ) : (
                'Confirm Refund'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
