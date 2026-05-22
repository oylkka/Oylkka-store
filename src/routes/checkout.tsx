import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Gift, Loader2, ShoppingCart, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type PaymentMethodOption,
  PaymentSelector,
} from '#/components/checkout/payment-selector';
import Footer from '#/components/layout/footer';
import Header from '#/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { BD_DISTRICTS } from '@/lib/bd-districts';
import { QUERY_KEYS } from '@/lib/constants';
import { useCart } from '@/services/cart';

export const Route = createFileRoute('/checkout')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/signin' });
    }
  },
  component: RouteComponent,
});

type ShippingForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  upzila: string;
  district: string;
  postalCode: string;
  comment: string;
};

const defaultForm: ShippingForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  upzila: '',
  district: '',
  postalCode: '',
  comment: '',
};

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart, isLoading, isError } = useCart();
  const [form, setForm] = useState<ShippingForm>(defaultForm);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodOption>('BKASH');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [myVouchers, setMyVouchers] = useState<
    {
      id: string;
      coupon: {
        id: string;
        code: string;
        description: string | null;
        type: string;
        value: number;
        freeShipping: boolean;
        shippingDiscount: number | null;
      };
    }[]
  >([]);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    fetch('/api/vouchers/my')
      .then((r) => r.json())
      .then((data) => {
        if (data.vouchers) setMyVouchers(data.vouchers);
      })
      .catch(() => {});

    fetch('/api/vouchers/auto-apply')
      .then((r) => r.json())
      .then((data) => {
        if (data.vouchers) {
          for (const v of data.vouchers) {
            if (v.isCollected) {
              setSelectedVoucherIds((prev) => new Set(prev).add(v.id));
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  if (isLoading) return <CheckoutSkeleton />;
  if (isError || !cart) return <CheckoutError />;
  if (cart.items.length === 0) {
    navigate({ to: '/cart' });
    return null;
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.savedPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const groupedByShop = cart.items.reduce<
    Record<
      string,
      {
        shop: { id: string; name: string; slug: string; shippingCost: number };
        items: typeof cart.items;
      }
    >
  >((groups, item) => {
    const shop = item.product.shop;
    if (!shop) return groups;
    if (!groups[shop.id]) {
      groups[shop.id] = { shop, items: [] };
    }
    groups[shop.id].items.push(item);
    return groups;
  }, {});

  const shippingPerShop = Object.values(groupedByShop).map(
    ({ shop, items }) => {
      const hasNonFree = items.some((item) => !item.product.freeShipping);
      return { shopName: shop.name, cost: hasNonFree ? shop.shippingCost : 0 };
    },
  );
  const baseShipping = shippingPerShop.reduce((sum, s) => sum + s.cost, 0);

  let finalShipping = baseShipping;
  let totalVoucherDiscount = 0;
  let voucherShippingDiscount = 0;
  const hasFreeShippingVoucher = myVouchers.some(
    (v) => selectedVoucherIds.has(v.id) && v.coupon.freeShipping,
  );

  if (hasFreeShippingVoucher) {
    finalShipping = 0;
  } else {
    for (const v of myVouchers) {
      if (selectedVoucherIds.has(v.id) && v.coupon.shippingDiscount) {
        voucherShippingDiscount += v.coupon.shippingDiscount;
      }
    }
    finalShipping = Math.max(0, baseShipping - voucherShippingDiscount);
  }

  if (appliedCoupon) {
    totalVoucherDiscount += appliedCoupon.discountAmount;
  }

  const total = subtotal + finalShipping - totalVoucherDiscount;

  function updateField(field: keyof ShippingForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleVoucher(voucherId: string) {
    setSelectedVoucherIds((prev) => {
      const next = new Set(prev);
      if (next.has(voucherId)) {
        next.delete(voucherId);
      } else {
        next.add(voucherId);
      }
      return next;
    });
  }

  async function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await response.json();

      if (!data.valid) {
        toast.error(data.error || 'Invalid coupon');
        setIsValidatingCoupon(false);
        return;
      }

      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        description: data.description,
      });
      toast.success(
        `Coupon applied! You saved ৳${data.discountAmount.toLocaleString()}`,
      );
    } catch {
      toast.error('Failed to validate coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
  }

  async function handlePlaceOrder() {
    if (!form.name || !form.email || !form.phone) {
      toast.error('Please fill in your shipping details');
      return;
    }
    if (!form.address || !form.upzila || !form.district) {
      toast.error('Please fill in your shipping address');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const createResponse = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingName: form.name,
          shippingEmail: form.email,
          shippingPhone: form.phone,
          shippingAddress: form.address,
          shippingUpzila: form.upzila,
          shippingDistrict: form.district,
          shippingPostalCode: form.postalCode || undefined,
          shippingComment: form.comment || undefined,
          paymentMethod,
          voucherIds: [...selectedVoucherIds],
        }),
      });

      const orderData = await createResponse.json();

      if (!createResponse.ok) {
        toast.error(orderData.error || 'Failed to create order');
        setIsPlacingOrder(false);
        return;
      }

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });

      if (orderData.paymentMethod === 'CASH_ON_DELIVERY') {
        toast.success('Order placed successfully!');
        navigate({
          to: '/checkout/confirmation',
          search: { orderId: orderData.orderId },
        });
        return;
      }

      const payResponse = await fetch('/api/checkout/bkash-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });

      const payData = await payResponse.json();

      if (!payResponse.ok) {
        toast.error(payData.error || 'Failed to initiate payment');
        setIsPlacingOrder(false);
        return;
      }

      window.location.href = payData.checkoutURL;
    } catch {
      toast.error('Something went wrong. Please try again.');
      setIsPlacingOrder(false);
    }
  }

  return (
    <>
      <Header />
      <div className='container py-8 md:py-12'>
        <div className='mx-auto max-w-5xl'>
          <button
            type='button'
            onClick={() => navigate({ to: '/cart' })}
            className='mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Cart
          </button>

          <div className='grid gap-8 lg:grid-cols-5'>
            <div className='lg:col-span-3 space-y-6'>
              <ShippingAddressForm form={form} updateField={updateField} />
            </div>

            <div className='lg:col-span-2 space-y-6'>
              <Card className='rounded-2xl border-border shadow-none p-6'>
                <h2 className='text-lg font-semibold mb-4'>Order Summary</h2>

                {Object.values(groupedByShop).map(({ shop, items }) => (
                  <div key={shop.id} className='mb-4'>
                    <p className='text-sm font-medium text-muted-foreground mb-2'>
                      {shop.name}
                    </p>
                    <div className='space-y-3'>
                      {items.map((item) => {
                        const price = item.savedPrice ?? item.product.price;
                        const imageUrl =
                          item.variant?.imageUrl ??
                          item.product.images[0]?.imageUrl;

                        return (
                          <div key={item.id} className='flex gap-3'>
                            <div className='h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted'>
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.product.productName}
                                  className='h-full w-full object-cover'
                                />
                              ) : (
                                <div className='flex h-full w-full items-center justify-center'>
                                  <ShoppingCart className='h-5 w-5 text-muted-foreground' />
                                </div>
                              )}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium truncate'>
                                {item.product.productName}
                              </p>
                              {item.variant && (
                                <p className='text-xs text-muted-foreground'>
                                  {item.variant.name}
                                </p>
                              )}
                              <p className='text-xs text-muted-foreground'>
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className='text-sm font-semibold shrink-0'>
                              ৳{(price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <Separator className='my-4' />

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Subtotal</span>
                    <span className='font-medium'>
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {totalVoucherDiscount > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Discount</span>
                      <span className='font-medium'>
                        -৳{totalVoucherDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Shipping</span>
                    <span className='font-medium'>
                      {shippingPerShop.length > 0 ? (
                        <span>
                          ৳{finalShipping.toLocaleString()}
                          {shippingPerShop.some((s) => s.cost > 0) && (
                            <span className='text-xs text-muted-foreground ml-1'>
                              (
                              {shippingPerShop
                                .filter((s) => s.cost > 0)
                                .map((s) => s.shopName)
                                .join(', ')}
                              )
                            </span>
                          )}
                        </span>
                      ) : (
                        'Free'
                      )}
                    </span>
                  </div>

                  {hasFreeShippingVoucher && baseShipping > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Shipping Discount (Free)</span>
                      <span className='font-medium'>
                        -৳{baseShipping.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {voucherShippingDiscount > 0 && !hasFreeShippingVoucher && (
                    <div className='flex justify-between text-green-600'>
                      <span>Shipping Discount</span>
                      <span className='font-medium'>
                        -৳{voucherShippingDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Separator className='my-2' />

                  <div className='flex justify-between text-base font-semibold'>
                    <span>Total</span>
                    <span>৳{Math.max(0, total).toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {myVouchers.length > 0 && (
                <Card className='rounded-2xl border-border shadow-none p-6'>
                  <div className='flex items-center gap-2 text-sm font-medium mb-3'>
                    <Gift className='h-4 w-4' />
                    Your Vouchers
                  </div>
                  <div className='space-y-2'>
                    {myVouchers.map((v) => (
                      <label
                        key={v.id}
                        htmlFor={`voucher-${v.id}`}
                        className='flex items-start gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors'
                      >
                        <Checkbox
                          id={`voucher-${v.id}`}
                          checked={selectedVoucherIds.has(v.id)}
                          onCheckedChange={() => toggleVoucher(v.id)}
                          className='mt-0.5'
                        />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium'>{v.coupon.code}</p>
                          {v.coupon.description && (
                            <p className='text-xs text-muted-foreground'>
                              {v.coupon.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </Card>
              )}

              <Card className='rounded-2xl border-border shadow-none p-6'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm font-medium'>
                      <Tag className='h-4 w-4' />
                      Coupon Code
                    </div>
                    {appliedCoupon ? (
                      <button
                        type='button'
                        onClick={handleRemoveCoupon}
                        className='flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors'
                      >
                        <X className='h-3 w-3' />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  {appliedCoupon ? (
                    <div className='rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'>
                      <p className='font-medium'>{appliedCoupon.code}</p>
                      {appliedCoupon.description && (
                        <p className='text-xs opacity-80'>
                          {appliedCoupon.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className='flex gap-2'>
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder='Enter code'
                        className='flex-1'
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleApplyCoupon();
                        }}
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className='shrink-0'
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              <Card className='rounded-2xl border-border shadow-none p-6'>
                <h2 className='text-lg font-semibold mb-4'>Payment Method</h2>
                <PaymentSelector
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                />
              </Card>

              <Button
                size='lg'
                className='w-full h-12 text-base rounded-xl'
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Placing Order...
                  </>
                ) : (
                  `Place Order ${paymentMethod === 'CASH_ON_DELIVERY' ? '(COD)' : ''}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function ShippingAddressForm({
  form,
  updateField,
}: {
  form: ShippingForm;
  updateField: (field: keyof ShippingForm, value: string) => void;
}) {
  return (
    <Card className='rounded-2xl border-border shadow-none p-6'>
      <h2 className='text-lg font-semibold mb-4'>Shipping Address</h2>
      <FieldGroup>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field>
            <FieldLabel htmlFor='name'>Full Name</FieldLabel>
            <Input
              id='name'
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder='John Doe'
              autoComplete='name'
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input
              id='email'
              type='email'
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder='you@example.com'
              autoComplete='email'
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor='phone'>Phone Number</FieldLabel>
          <Input
            id='phone'
            type='tel'
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder='01XXXXXXXXX'
            autoComplete='tel'
          />
        </Field>

        <Field>
          <FieldLabel htmlFor='address'>Address</FieldLabel>
          <textarea
            id='address'
            rows={3}
            className='flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            placeholder='House, Road, Area, Village...'
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
        </Field>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field>
            <FieldLabel htmlFor='upzila'>Upzila / Thana</FieldLabel>
            <Input
              id='upzila'
              value={form.upzila}
              onChange={(e) => updateField('upzila', e.target.value)}
              placeholder='Mirpur, Sadar, etc.'
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='postalCode'>Postal Code (optional)</FieldLabel>
            <Input
              id='postalCode'
              value={form.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value)}
              placeholder='1205'
              autoComplete='postal-code'
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor='district'>District</FieldLabel>
          <SearchableSelect
            options={BD_DISTRICTS}
            value={form.district}
            onChange={(value) => updateField('district', value)}
            placeholder='Select district...'
            searchPlaceholder='Search district...'
            emptyMessage='No district found'
          />
        </Field>

        <Field>
          <FieldLabel htmlFor='comment'>Delivery Note (optional)</FieldLabel>
          <textarea
            id='comment'
            rows={2}
            className='flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            placeholder='Any special instructions for delivery?'
            value={form.comment}
            onChange={(e) => updateField('comment', e.target.value)}
          />
        </Field>
      </FieldGroup>
    </Card>
  );
}

function CheckoutSkeleton() {
  return (
    <>
      <Header />
      <div className='container py-8 md:py-12'>
        <div className='mx-auto max-w-5xl space-y-6'>
          <Skeleton className='h-6 w-32' />
          <div className='grid gap-8 lg:grid-cols-5'>
            <div className='lg:col-span-3 space-y-6'>
              <Card className='rounded-2xl border-border shadow-none p-6 space-y-4'>
                <Skeleton className='h-6 w-40' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <div className='grid grid-cols-2 gap-4'>
                  <Skeleton className='h-10' />
                  <Skeleton className='h-10' />
                </div>
              </Card>
            </div>
            <div className='lg:col-span-2 space-y-6'>
              <Card className='rounded-2xl border-border shadow-none p-6 space-y-4'>
                <Skeleton className='h-6 w-32' />
                {[1, 2].map((i) => (
                  <div key={i} className='flex gap-3'>
                    <Skeleton className='h-14 w-14 rounded-xl' />
                    <div className='flex-1 space-y-1'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function CheckoutError() {
  return (
    <>
      <Header />
      <div className='container py-8 md:py-12'>
        <div className='mx-auto max-w-md text-center'>
          <h2 className='text-sm font-semibold'>Something went wrong</h2>
          <p className='text-sm text-muted-foreground mt-1'>
            Could not load your cart. Please try again.
          </p>
          <Button
            variant='outline'
            className='mt-4'
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}
