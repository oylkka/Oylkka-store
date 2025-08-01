'use client';

import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Gift,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  RotateCcw,
  Share2,
  Star,
  Truck,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderConfirmation } from '@/services';

interface OrderItem {
  id: string;
  orderId: string;
  productSku: string;
  productName: string;
  shopId: string;
  variantInfo: {
    variantId: string;
    variantName: string;
    variantSku: string;
  };
  quantity: number;
  price: number;
  discount: number;
  weight: number | null;
  status: string;
  isReviewed: boolean;
  image: string;
}

// Status configuration
const statusConfig = {
  PENDING: {
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    label: 'Pending',
    progress: 10,
    description: 'Order received and being processed',
  },
  PROCESSING: {
    variant: 'default' as const,
    icon: Package,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    label: 'Processing',
    progress: 35,
    description: 'Preparing your items for shipment',
  },
  SHIPPED: {
    variant: 'outline' as const,
    icon: Truck,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    label: 'Shipped',
    progress: 70,
    description: 'On the way to your address',
  },
  DELIVERED: {
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    label: 'Delivered',
    progress: 100,
    description: 'Successfully delivered',
  },
  CANCELLED: {
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'Cancelled',
    progress: 0,
    description: 'Order has been cancelled',
  },
  REFUNDED: {
    variant: 'outline' as const,
    icon: RotateCcw,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    label: 'Refunded',
    progress: 0,
    description: 'Full refund has been processed',
  },
};

const paymentStatusConfig = {
  PENDING: { variant: 'secondary' as const, label: 'Pending Payment' },
  PAID: { variant: 'default' as const, label: 'Payment Confirmed' },
  FAILED: { variant: 'destructive' as const, label: 'Payment Failed' },
  REFUNDED: { variant: 'outline' as const, label: 'Refunded' },
};

const paymentMethodConfig = {
  CASH_ON_DELIVERY: { icon: DollarSign, label: 'Cash on Delivery' },
  CARD: { icon: CreditCard, label: 'Card Payment' },
  BANK_TRANSFER: { icon: CreditCard, label: 'Bank Transfer' },
  WALLET: { icon: CreditCard, label: 'Digital Wallet' },
};

// Loading skeleton
function OrderSkeleton() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
            <Skeleton className='h-6 w-20' />
          </div>
        </CardHeader>
      </Card>

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent className='space-y-4'>
              {Array.from({ length: 2 }).map((_, i) => (
                //  biome-ignore lint: error
                <div key={i} className='flex gap-4'>
                  <Skeleton className='h-16 w-16 rounded' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent className='space-y-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                //  biome-ignore lint: error
                <div key={i} className='flex justify-between'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-16' />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const { isPending, data, isError } = useOrderConfirmation({ id: orderId });
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const copyOrderId = async () => {
    if (data?.order?.orderNumber) {
      await navigator.clipboard.writeText(data.order.orderNumber);
      setCopiedOrderId(true);
      toast.success('Order ID copied to clipboard');
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  if (isPending) {
    return (
      <div className='bg-background min-h-screen'>
        <div className='mx-auto max-w-7xl p-4 sm:p-6'>
          <div className='mb-6'>
            <Skeleton className='mb-2 h-8 w-48' />
            <Skeleton className='h-4 w-32' />
          </div>
          <OrderSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !data?.order) {
    return (
      <div className='bg-background min-h-screen'>
        <div className='mx-auto max-w-7xl p-4 sm:p-6'>
          <Card className='border-destructive/50 bg-destructive/5'>
            <CardContent className='pt-6'>
              <div className='text-destructive flex items-center gap-3'>
                <div className='bg-destructive/20 rounded-full p-2'>
                  <XCircle className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Order not found</h3>
                  <p className='text-destructive/80 text-sm'>
                    The order you&#39;re looking for doesn&#39;t exist or has
                    been removed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const order = data.order;
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
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
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-7xl p-4 sm:p-6'>
        {/* Header */}
        <div className='mb-6 sm:mb-8'>
          <div className='mb-4 flex items-center gap-4'>
            <Link href='/orders'>
              <Button variant='ghost' size='sm' className='gap-2'>
                <ArrowLeft className='h-4 w-4' />
                Back to Orders
              </Button>
            </Link>
          </div>

          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-foreground text-2xl font-bold sm:text-3xl'>
                Order #{order.orderNumber}
              </h1>
              <p className='text-muted-foreground mt-1'>
                Placed on {format(new Date(order.createdAt), 'PPP')} at{' '}
                {format(new Date(order.createdAt), 'p')}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={copyOrderId}>
                {copiedOrderId ? (
                  <CheckCircle className='mr-2 h-4 w-4' />
                ) : (
                  <Copy className='mr-2 h-4 w-4' />
                )}
                {copiedOrderId ? 'Copied!' : 'Copy Order ID'}
              </Button>
              <Button variant='outline' size='sm'>
                <Share2 className='mr-2 h-4 w-4' />
                Share
              </Button>
              <Button variant='outline' size='sm'>
                <Download className='mr-2 h-4 w-4' />
                Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Order Status Card */}
        <Card className='mb-6 overflow-hidden sm:mb-8'>
          <div className='bg-muted h-1'>
            <div
              className='bg-primary h-full transition-all duration-1000'
              style={{ width: `${statusInfo?.progress || 0}%` }}
            />
          </div>

          <CardContent className='pt-6'>
            <div className='mb-6 flex items-center gap-4'>
              <div className={`rounded-xl p-3 ${statusInfo?.bgColor} border`}>
                <StatusIcon className={`h-6 w-6 ${statusInfo?.color}`} />
              </div>
              <div className='flex-1'>
                <div className='mb-2 flex items-center gap-3'>
                  <Badge variant={statusInfo?.variant} className='font-medium'>
                    {statusInfo?.label}
                  </Badge>
                  <Badge variant={paymentInfo?.variant} className='font-medium'>
                    {paymentInfo?.label}
                  </Badge>
                </div>
                <p className='text-muted-foreground'>
                  {statusInfo?.description}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Order Progress</span>
                <span className='font-medium'>{statusInfo?.progress}%</span>
              </div>
              <Progress value={statusInfo?.progress || 0} className='h-2' />
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className='bg-muted/50 mt-6 rounded-lg p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <Truck className='text-primary h-4 w-4' />
                  <span className='font-medium'>Tracking Information</span>
                </div>
                <p className='text-muted-foreground text-sm'>
                  Tracking Number:{' '}
                  <span className='font-mono'>{order.trackingNumber}</span>
                </p>
                {order.carrier && (
                  <p className='text-muted-foreground text-sm'>
                    Carrier: {order.carrier}
                  </p>
                )}
                {order.estimatedDelivery && (
                  <p className='text-muted-foreground text-sm'>
                    Estimated Delivery:{' '}
                    {format(new Date(order.estimatedDelivery), 'PPP')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Left Column - Order Items & Details */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='h-5 w-5' />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {order.items.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className='flex gap-4 rounded-lg border p-4'
                  >
                    <div className='relative h-16 w-16 flex-shrink-0 sm:h-20 sm:w-20'>
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.productName}
                        fill
                        className='rounded-md object-cover'
                      />
                    </div>

                    <div className='min-w-0 flex-1'>
                      <h3 className='text-foreground truncate font-medium'>
                        {item.productName}
                      </h3>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        {item.variantInfo.variantName}
                      </p>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        SKU: {item.productSku}
                      </p>

                      <div className='mt-3 flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          <span className='text-muted-foreground text-sm'>
                            Qty: {item.quantity}
                          </span>
                          <Badge variant='outline' className='text-xs'>
                            {item.status}
                          </Badge>
                        </div>

                        <div className='text-right'>
                          <p className='font-medium'>
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.discount > 0 && (
                            <p className='text-muted-foreground text-xs line-through'>
                              ৳
                              {(
                                (item.price + item.discount) *
                                item.quantity
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className='mt-3 flex gap-2'>
                        {order.status === 'DELIVERED' && !item.isReviewed && (
                          <Button variant='outline' size='sm'>
                            <Star className='mr-2 h-4 w-4' />
                            Write Review
                          </Button>
                        )}
                        <Button variant='outline' size='sm'>
                          <Package className='mr-2 h-4 w-4' />
                          Buy Again
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <p className='font-medium'>{order.shippingAddress.name}</p>
                  <p className='text-muted-foreground'>
                    {order.shippingAddress.address}
                  </p>
                  <p className='text-muted-foreground'>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.district}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <div className='mt-3 flex items-center gap-4 border-t pt-3'>
                    <div className='flex items-center gap-2'>
                      <Phone className='text-muted-foreground h-4 w-4' />
                      <span className='text-sm'>
                        {order.shippingAddress.phone}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Mail className='text-muted-foreground h-4 w-4' />
                      <span className='text-sm'>
                        {order.shippingAddress.email}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(order.notes || order.giftMessage) && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <FileText className='h-5 w-5' />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {order.notes && (
                    <div>
                      <h4 className='mb-2 font-medium'>Order Notes</h4>
                      <p className='text-muted-foreground text-sm'>
                        {order.notes}
                      </p>
                    </div>
                  )}
                  {order.giftMessage && (
                    <div>
                      <h4 className='mb-2 flex items-center gap-2 font-medium'>
                        <Gift className='h-4 w-4' />
                        Gift Message
                      </h4>
                      <p className='text-muted-foreground text-sm'>
                        {order.giftMessage}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className='space-y-6'>
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5' />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Subtotal</span>
                  <span>৳{order.subtotal.toLocaleString()}</span>
                </div>

                {order.discount > 0 && (
                  <div className='text-primary flex justify-between'>
                    <span>Discount</span>
                    <span>-৳{order.discount.toLocaleString()}</span>
                  </div>
                )}

                {order.couponDiscount > 0 && (
                  <div className='text-primary flex justify-between'>
                    <span>Coupon ({order.couponCode})</span>
                    <span>-৳{order.couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Shipping</span>
                  <span>
                    {order.shipping === 0
                      ? 'Free'
                      : `৳${order.shipping.toLocaleString()}`}
                  </span>
                </div>

                {order.tax > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Tax</span>
                    <span>৳{order.tax.toLocaleString()}</span>
                  </div>
                )}

                <Separator />

                <div className='flex justify-between text-lg font-semibold'>
                  <span>Total</span>
                  <span>
                    ৳{order.total.toLocaleString()} {order.currency}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PaymentIcon className='h-5 w-5' />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Payment Method</span>
                  <span>{paymentMethodInfo?.label}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Payment Status</span>
                  <Badge variant={paymentInfo?.variant}>
                    {paymentInfo?.label}
                  </Badge>
                </div>
                {order.metadata.confirmedAt && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Confirmed At</span>
                    <span className='text-sm'>
                      {format(new Date(order.metadata.confirmedAt), 'PPp')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {order.status === 'PROCESSING' && (
                  <Button
                    variant='outline'
                    className='w-full justify-start bg-transparent'
                  >
                    <XCircle className='mr-2 h-4 w-4' />
                    Cancel Order
                  </Button>
                )}

                {(order.status === 'SHIPPED' ||
                  order.status === 'PROCESSING') && (
                  <Button
                    variant='outline'
                    className='w-full justify-start bg-transparent'
                  >
                    <Truck className='mr-2 h-4 w-4' />
                    Track Package
                  </Button>
                )}

                {order.status === 'DELIVERED' && (
                  <>
                    <Button
                      variant='outline'
                      className='w-full justify-start bg-transparent'
                    >
                      <Package className='mr-2 h-4 w-4' />
                      Reorder Items
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full justify-start bg-transparent'
                    >
                      <AlertCircle className='mr-2 h-4 w-4' />
                      Report Issue
                    </Button>
                  </>
                )}

                <Button
                  variant='outline'
                  className='w-full justify-start bg-transparent'
                >
                  <MessageSquare className='mr-2 h-4 w-4' />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary rounded-full p-1'>
                      <CheckCircle className='text-primary-foreground h-3 w-3' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>Order Placed</p>
                      <p className='text-muted-foreground text-xs'>
                        {format(new Date(order.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>

                  {order.metadata.confirmedAt && (
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary rounded-full p-1'>
                        <CheckCircle className='text-primary-foreground h-3 w-3' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>Order Confirmed</p>
                        <p className='text-muted-foreground text-xs'>
                          {format(new Date(order.metadata.confirmedAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'PROCESSING' && (
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary rounded-full p-1'>
                        <Package className='text-primary-foreground h-3 w-3' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>Processing</p>
                        <p className='text-muted-foreground text-xs'>
                          Your order is being prepared
                        </p>
                      </div>
                    </div>
                  )}

                  {['SHIPPED', 'DELIVERED'].includes(order.status) && (
                    <div className='flex items-center gap-3'>
                      <div className='bg-muted rounded-full p-1'>
                        <Truck className='text-muted-foreground h-3 w-3' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Shipped
                        </p>
                        <p className='text-muted-foreground text-xs'>Pending</p>
                      </div>
                    </div>
                  )}

                  {order.status === 'DELIVERED' && (
                    <div className='flex items-center gap-3'>
                      <div className='bg-muted rounded-full p-1'>
                        <CheckCircle className='text-muted-foreground h-3 w-3' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Delivered
                        </p>
                        <p className='text-muted-foreground text-xs'>Pending</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPageContainer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmationPage />
    </Suspense>
  );
}
