'use client';

import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  MapPin,
  Package,
  RotateCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserOrders } from '@/services/customer/orders';

interface OrderType {
  id: string;
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Enhanced status configuration with all statuses
const statusConfig = {
  PENDING: {
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
    label: 'Pending',
    progress: 10,
    description: 'Order received and being processed',
  },
  PROCESSING: {
    variant: 'default' as const,
    icon: Package,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    label: 'Processing',
    progress: 35,
    description: 'Preparing your items for shipment',
  },
  SHIPPED: {
    variant: 'outline' as const,
    icon: Truck,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20',
    label: 'Shipped',
    progress: 70,
    description: 'On the way to your address',
  },
  DELIVERED: {
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    label: 'Delivered',
    progress: 100,
    description: 'Successfully delivered',
  },
  CANCELLED: {
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    label: 'Cancelled',
    progress: 0,
    description: 'Order has been cancelled',
  },
  REFUNDED: {
    variant: 'outline' as const,
    icon: RotateCcw,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
    label: 'Refunded',
    progress: 0,
    description: 'Full refund has been processed',
  },
  PARTIALLY_REFUNDED: {
    variant: 'outline' as const,
    icon: AlertCircle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
    label: 'Partial Refund',
    progress: 0,
    description: 'Partial refund has been processed',
  },
};

const paymentStatusConfig = {
  PENDING: {
    variant: 'secondary' as const,
    color: 'text-muted-foreground',
    label: 'Pending',
    bgColor: 'bg-muted/50',
  },
  PAID: {
    variant: 'default' as const,
    color: 'text-primary',
    label: 'Paid',
    bgColor: 'bg-primary/10',
  },
  FAILED: {
    variant: 'destructive' as const,
    color: 'text-destructive',
    label: 'Failed',
    bgColor: 'bg-destructive/10',
  },
  REFUNDED: {
    variant: 'outline' as const,
    color: 'text-muted-foreground',
    label: 'Refunded',
    bgColor: 'bg-muted/50',
  },
};

const paymentMethodConfig = {
  CASH_ON_DELIVERY: {
    icon: DollarSign,
    label: 'Cash on Delivery',
    color: 'text-foreground',
  },
  CARD: {
    icon: CreditCard,
    label: 'Card Payment',
    color: 'text-foreground',
  },
  BANK_TRANSFER: {
    icon: CreditCard,
    label: 'Bank Transfer',
    color: 'text-foreground',
  },
  WALLET: {
    icon: CreditCard,
    label: 'Digital Wallet',
    color: 'text-foreground',
  },
};

// Loading skeleton component
function OrderSkeleton() {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-12 w-12 rounded-lg' />
            <div className='space-y-2'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-48' />
            </div>
          </div>
          <Skeleton className='h-6 w-20' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            //  biome-ignore lint: error
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-6 w-24' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerOrdersPage() {
  const searchParams = useSearchParams();

  const { isPending, data, isError } = useUserOrders();

  const router = useRouter();

  // Function to handle tab changes and update URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value.toUpperCase());
    }
    router.push(`?${params.toString()}`);
  };

  // Get current tab from URL params
  const getCurrentTab = () => {
    const urlStatus = searchParams.get('status');
    if (!urlStatus) {
      return 'all';
    }
    return urlStatus.toLowerCase();
  };

  if (isPending) {
    return (
      <div className='bg-background min-h-screen'>
        <div className='mx-auto max-w-7xl'>
          {/* Header Skeleton */}
          <div className='mb-8'>
            <Skeleton className='mb-4 h-10 w-64' />
            <Skeleton className='h-6 w-96' />
          </div>

          {/* Tabs Skeleton */}
          <div className='mb-8'>
            <Skeleton className='h-10 w-full max-w-2xl' />
          </div>

          {/* Orders Skeleton */}
          <div className='space-y-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              //  biome-ignore lint: error
              <OrderSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className='bg-background min-h-screen'>
        <div className='mx-auto max-w-7xl'>
          <Card className='border-destructive/50 bg-destructive/5'>
            <CardContent className='pt-6'>
              <div className='text-destructive flex items-center gap-3'>
                <div className='bg-destructive/20 rounded-full p-2'>
                  <XCircle className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Unable to load orders</h3>
                  <p className='text-destructive/80 text-sm'>
                    Please check your connection and try again.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ordersByStatus = {
    all: data || [],
    pending: (data || []).filter(
      (order: OrderType) => order.status === 'PENDING',
    ),
    processing: (data || []).filter(
      (order: OrderType) => order.status === 'PROCESSING',
    ),
    shipped: (data || []).filter(
      (order: OrderType) => order.status === 'SHIPPED',
    ),
    delivered: (data || []).filter(
      (order: OrderType) => order.status === 'DELIVERED',
    ),
    cancelled: (data || []).filter(
      (order: OrderType) => order.status === 'CANCELLED',
    ),
    refunded: (data || []).filter(
      (order: OrderType) =>
        order.status === 'REFUNDED' || order.status === 'PARTIALLY_REFUNDED',
    ),
  };

  if (!data || data.length === 0) {
    return (
      <div className='bg-background min-h-screen'>
        <div className='mx-auto max-w-7xl'>
          <div className='flex min-h-[60vh] items-center justify-center'>
            <Card className='bg-card/50 w-full max-w-md border-0'>
              <CardContent className='pt-8 text-center'>
                <div className='bg-muted mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full'>
                  <ShoppingBag className='text-muted-foreground h-8 w-8' />
                </div>
                <h3 className='text-foreground mb-2 text-lg font-semibold'>
                  No orders found
                </h3>
                <p className='text-muted-foreground mb-6'>
                  You haven&#39;t placed any orders yet. Start shopping to see
                  your orders here.
                </p>
                <Button variant='default'>
                  <ShoppingBag className='mr-2 h-4 w-4' />
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-7xl'>
        {/* Modern Header */}
        <div className='mb-8'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='bg-primary/10 rounded-lg p-3'>
              <Package className='text-primary h-8 w-8' />
            </div>
            <div>
              <h1 className='text-foreground text-2xl font-bold md:text-4xl'>
                My Orders
              </h1>
              <p className='text-muted-foreground mt-1'>
                Track and manage your orders • {(data || []).length} total order
                {(data || []).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Tabs */}
        <Tabs
          value={getCurrentTab()}
          onValueChange={handleTabChange}
          className='mb-8'
        >
          <ScrollArea className='w-full whitespace-nowrap'>
            <TabsList className='bg-card text-muted-foreground inline-flex h-10 w-max items-center justify-start rounded-md p-1'>
              <TabsTrigger
                value='all'
                className='px-3 py-1.5 text-xs whitespace-nowrap'
              >
                All ({ordersByStatus.all.length})
              </TabsTrigger>
              <TabsTrigger
                value='pending'
                className='px-3 py-1.5 text-xs whitespace-nowrap'
              >
                Pending ({ordersByStatus.pending.length})
              </TabsTrigger>
              <TabsTrigger
                value='processing'
                className='px-3 py-1.5 text-xs whitespace-nowrap'
              >
                Processing ({ordersByStatus.processing.length})
              </TabsTrigger>
              <TabsTrigger
                value='shipped'
                className='px-3 py-1.5 text-xs whitespace-nowrap'
              >
                Shipped ({ordersByStatus.shipped.length})
              </TabsTrigger>
              <TabsTrigger
                value='delivered'
                className='px-3 py-1.5 text-xs whitespace-nowrap'
              >
                Delivered ({ordersByStatus.delivered.length})
              </TabsTrigger>
              <TabsTrigger
                value='cancelled'
                className='px-3 py-1.5 text-xs whitespace-nowrap'
              >
                Cancelled ({ordersByStatus.cancelled.length})
              </TabsTrigger>
              <TabsTrigger
                value='refunded'
                className='px-3 py-1.5 text-xs whitespace-nowrap'
              >
                Refunded ({ordersByStatus.refunded.length})
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>

          {Object.entries(ordersByStatus).map(([key, orders]) => (
            <TabsContent key={key} value={key} className='mt-6'>
              {orders.length === 0 ? (
                // Empty state for specific tab
                <div className='flex min-h-[40vh] items-center justify-center'>
                  <Card className='bg-card/50 w-full max-w-md border-0'>
                    <CardContent className='pt-8 text-center'>
                      <div className='bg-muted mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full'>
                        <ShoppingBag className='text-muted-foreground h-8 w-8' />
                      </div>
                      <h3 className='text-foreground mb-2 text-lg font-semibold'>
                        No {key === 'all' ? '' : key} orders found
                      </h3>
                      <p className='text-muted-foreground mb-6'>
                        {key === 'all'
                          ? "You haven't placed any orders yet. Start shopping to see your orders here."
                          : `You don't have any ${key} orders at the moment.`}
                      </p>
                      {key === 'all' && (
                        <Button variant='default'>
                          <ShoppingBag className='mr-2 h-4 w-4' />
                          Start Shopping
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Orders list
                <div className='space-y-6'>
                  {orders.map((order: OrderType) => {
                    const statusInfo =
                      statusConfig[order.status as keyof typeof statusConfig];
                    const paymentInfo =
                      paymentStatusConfig[
                        order.paymentStatus as keyof typeof paymentStatusConfig
                      ];
                    const paymentMethodInfo =
                      paymentMethodConfig[
                        order.paymentMethod as keyof typeof paymentMethodConfig
                      ];

                    const StatusIcon = statusInfo?.icon || Package;
                    const PaymentIcon = paymentMethodInfo?.icon || CreditCard;

                    return (
                      <Card
                        key={order.id}
                        className='group bg-card overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                      >
                        {/* Status Progress Bar */}
                        <div className='bg-muted h-1'>
                          <div
                            className='bg-primary h-full transition-all duration-1000'
                            style={{ width: `${statusInfo?.progress || 0}%` }}
                          />
                        </div>

                        <CardHeader className='pb-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-4'>
                              <div
                                className={`rounded-xl p-3 ${statusInfo?.bgColor || 'bg-muted/50'} ${statusInfo?.borderColor} border`}
                              >
                                <StatusIcon
                                  className={`h-6 w-6 ${statusInfo?.color || 'text-muted-foreground'}`}
                                />
                              </div>
                              <div>
                                <CardTitle className='text-foreground text-xl font-bold'>
                                  Order #{order.orderNumber}
                                </CardTitle>
                                <div className='text-muted-foreground mt-2 flex items-center gap-4 text-sm'>
                                  <div className='flex items-center gap-1'>
                                    <Calendar className='h-4 w-4' />
                                    {format(
                                      new Date(order.createdAt),
                                      'MMM dd, yyyy',
                                    )}
                                  </div>
                                  <div className='flex items-center gap-1'>
                                    <Clock className='h-4 w-4' />
                                    {format(new Date(order.createdAt), 'HH:mm')}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className='text-right'>
                              <Badge
                                variant={statusInfo?.variant || 'secondary'}
                                className='mb-2 font-medium'
                              >
                                {statusInfo?.label || order.status}
                              </Badge>
                              <p className='text-muted-foreground max-w-32 text-xs'>
                                {statusInfo?.description}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className='pt-0'>
                          <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
                            {/* Payment Status */}
                            <div className='space-y-3'>
                              <h4 className='text-foreground flex items-center gap-2 font-semibold'>
                                <div className='bg-primary/10 rounded-lg p-1'>
                                  <CreditCard className='text-primary h-4 w-4' />
                                </div>
                                Payment
                              </h4>
                              <div className='space-y-2'>
                                <Badge
                                  variant={paymentInfo?.variant || 'secondary'}
                                  className='text-xs font-medium'
                                >
                                  {paymentInfo?.label || order.paymentStatus}
                                </Badge>
                                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                                  <PaymentIcon
                                    className={`h-4 w-4 ${paymentMethodInfo?.color}`}
                                  />
                                  <span>
                                    {paymentMethodInfo?.label ||
                                      order.paymentMethod}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Order Total */}
                            <div className='space-y-3'>
                              <h4 className='text-foreground flex items-center gap-2 font-semibold'>
                                <div className='bg-primary/10 rounded-lg p-1'>
                                  <DollarSign className='text-primary h-4 w-4' />
                                </div>
                                Total
                              </h4>
                              <div className='text-foreground text-2xl font-bold'>
                                ৳{order.total.toLocaleString()}
                              </div>
                              <p className='text-muted-foreground text-xs'>
                                BDT
                              </p>
                            </div>

                            {/* Delivery Info */}
                            <div className='space-y-3'>
                              <h4 className='text-foreground flex items-center gap-2 font-semibold'>
                                <div className='bg-primary/10 rounded-lg p-1'>
                                  <MapPin className='text-primary h-4 w-4' />
                                </div>
                                Delivery
                              </h4>
                              <div className='space-y-1'>
                                <p className='text-foreground text-sm'>
                                  Standard Delivery
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                  3-5 business days
                                </p>
                              </div>
                            </div>

                            {/* Enhanced Quick Actions */}
                            <div className='space-y-4'>
                              <h4 className='text-foreground flex items-center gap-2 font-semibold'>
                                <div className='bg-primary/10 rounded-lg p-1'>
                                  <Package className='text-primary h-4 w-4' />
                                </div>
                                Quick Actions
                              </h4>

                              {/* Primary Actions */}
                              <Link
                                href={`/dashboard/customer/orders/single-order?orderId=${order.orderNumber}`}
                              >
                                <div className='mb-2 space-y-2'>
                                  <Button
                                    variant='default'
                                    size='sm'
                                    className='group/btn bg-primary hover:bg-primary/90 text-primary-foreground w-full justify-start shadow-sm'
                                  >
                                    <Eye className='mr-3 h-4 w-4' />
                                    <span className='flex-1 text-left font-medium'>
                                      View Order Details
                                    </span>
                                    <ArrowRight className='h-4 w-4 opacity-70 transition-all group-hover/btn:translate-x-1 group-hover/btn:opacity-100' />
                                  </Button>
                                </div>
                              </Link>

                              {/* Secondary Actions */}
                              <div className='space-y-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='group/btn hover:bg-muted/50 w-full justify-start bg-transparent transition-all duration-200'
                                >
                                  <Download className='text-muted-foreground group-hover/btn:text-foreground mr-3 h-4 w-4' />
                                  <span className='text-muted-foreground group-hover/btn:text-foreground flex-1 text-left'>
                                    Download Invoice
                                  </span>
                                  <ArrowRight className='text-muted-foreground h-4 w-4 opacity-0 transition-all group-hover/btn:opacity-100' />
                                </Button>

                                {/* Conditional Actions based on status */}
                                {order.status === 'DELIVERED' && (
                                  <>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='group/btn hover:bg-primary/5 hover:border-primary/20 w-full justify-start bg-transparent transition-all duration-200'
                                    >
                                      <Package className='text-primary mr-3 h-4 w-4' />
                                      <span className='text-primary flex-1 text-left font-medium'>
                                        Reorder Items
                                      </span>
                                      <ArrowRight className='text-primary h-4 w-4 opacity-0 transition-all group-hover/btn:opacity-100' />
                                    </Button>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='group/btn hover:bg-muted/50 w-full justify-start bg-transparent transition-all duration-200'
                                    >
                                      <AlertCircle className='text-muted-foreground group-hover/btn:text-foreground mr-3 h-4 w-4' />
                                      <span className='text-muted-foreground group-hover/btn:text-foreground flex-1 text-left'>
                                        Report Issue
                                      </span>
                                      <ArrowRight className='text-muted-foreground h-4 w-4 opacity-0 transition-all group-hover/btn:opacity-100' />
                                    </Button>
                                  </>
                                )}

                                {(order.status === 'SHIPPED' ||
                                  order.status === 'PROCESSING') && (
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='group/btn hover:bg-primary/5 hover:border-primary/20 w-full justify-start bg-transparent transition-all duration-200'
                                  >
                                    <Truck className='text-primary mr-3 h-4 w-4' />
                                    <span className='text-primary flex-1 text-left font-medium'>
                                      Track Package
                                    </span>
                                    <ArrowRight className='text-primary h-4 w-4 opacity-0 transition-all group-hover/btn:opacity-100' />
                                  </Button>
                                )}

                                {order.status === 'PENDING' && (
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='group/btn hover:bg-destructive/5 hover:border-destructive/20 w-full justify-start bg-transparent transition-all duration-200'
                                  >
                                    <XCircle className='text-destructive mr-3 h-4 w-4' />
                                    <span className='text-destructive flex-1 text-left font-medium'>
                                      Cancel Order
                                    </span>
                                    <ArrowRight className='text-destructive h-4 w-4 opacity-0 transition-all group-hover/btn:opacity-100' />
                                  </Button>
                                )}

                                {(order.status === 'REFUNDED' ||
                                  order.status === 'PARTIALLY_REFUNDED') && (
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='group/btn hover:bg-muted/50 w-full justify-start bg-transparent transition-all duration-200'
                                  >
                                    <RotateCcw className='text-muted-foreground group-hover/btn:text-foreground mr-3 h-4 w-4' />
                                    <span className='text-muted-foreground group-hover/btn:text-foreground flex-1 text-left'>
                                      View Refund Details
                                    </span>
                                    <ArrowRight className='text-muted-foreground h-4 w-4 opacity-0 transition-all group-hover/btn:opacity-100' />
                                  </Button>
                                )}
                              </div>

                              {/* Quick Info */}
                              <div className='border-border border-t pt-2'>
                                <div className='text-muted-foreground flex items-center justify-between text-xs'>
                                  <span>Order ID</span>
                                  <span className='font-mono'>
                                    {order.id.slice(-8)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Progress Indicator for Active Orders */}
                          {(order.status === 'PROCESSING' ||
                            order.status === 'SHIPPED') && (
                            <>
                              <Separator className='my-6' />
                              <div className='bg-muted/50 rounded-lg p-4'>
                                <div className='flex items-center gap-3'>
                                  <div className='bg-primary/10 rounded-full p-2'>
                                    <StatusIcon className='text-primary h-5 w-5' />
                                  </div>
                                  <div className='flex-1'>
                                    <p className='text-foreground font-medium'>
                                      {statusInfo?.description}
                                    </p>
                                    <div className='mt-2'>
                                      <Progress
                                        value={statusInfo?.progress || 0}
                                        className='h-2'
                                      />
                                    </div>
                                  </div>
                                  <Badge
                                    variant='outline'
                                    className='bg-background'
                                  >
                                    {statusInfo?.progress}%
                                  </Badge>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default function OrdersPageContainer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerOrdersPage />
    </Suspense>
  );
}
