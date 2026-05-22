import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Gift, Loader2, ShoppingCart, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  type PaymentMethodOption,
  PaymentSelector,
} from '#/components/checkout/payment-selector';
import Footer from '#/components/layout/footer';
import Header from '#/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { BD_DISTRICTS } from '@/lib/bd-districts';
import { QUERY_KEYS } from '@/lib/constants';
import { useCart } from '@/services/cart';

const checkoutSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/,
      'Invalid BD phone number (e.g. 01XXXXXXXXX)',
    ),
  address: z.string().min(1, 'Address is required'),
  upzila: z.string().min(1, 'Upzila / Thana is required'),
  district: z.string().min(1, 'District is required'),
  postalCode: z
    .string()
    .regex(/^\d{4}$/, 'Postal code must be 4 digits')
    .optional()
    .or(z.literal('')),
  comment: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const Route = createFileRoute('/checkout')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/signin' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart, isLoading, isError } = useCart();
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      upzila: '',
      district: '',
      postalCode: '',
      comment: '',
    },
  });

  const formValues = watch();

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

  async function onPlaceOrder(values: CheckoutFormValues) {
    setIsPlacingOrder(true);

    try {
      const createResponse = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingName: values.name,
          shippingEmail: values.email,
          shippingPhone: values.phone,
          shippingAddress: values.address,
          shippingUpzila: values.upzila,
          shippingDistrict: values.district,
          shippingPostalCode: values.postalCode || undefined,
          shippingComment: values.comment || undefined,
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

          <form onSubmit={handleSubmit(onPlaceOrder)}>
            <div className='grid gap-8 lg:grid-cols-5'>
              <div className='lg:col-span-3 space-y-6'>
                <ShippingAddressForm
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  formValues={formValues}
                />
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
                            <p className='text-sm font-medium'>
                              {v.coupon.code}
                            </p>
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
                  type='submit'
                  size='lg'
                  className='w-full h-12 text-base rounded-xl'
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
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

function ShippingAddressForm({
  register,
  errors,
  setValue,
  formValues,
}: {
  register: ReturnType<typeof useForm<CheckoutFormValues>>['register'];
  errors: ReturnType<typeof useForm<CheckoutFormValues>>['formState']['errors'];
  setValue: ReturnType<typeof useForm<CheckoutFormValues>>['setValue'];
  formValues: CheckoutFormValues;
}) {
  return (
    <Card className='rounded-2xl border-border shadow-none p-6'>
      <h2 className='text-lg font-semibold mb-4'>Shipping Address</h2>
      <FieldGroup>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor='name'>Full Name</FieldLabel>
            <Input
              id='name'
              type='text'
              placeholder='John Doe'
              autoComplete='name'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input
              id='email'
              type='email'
              placeholder='you@example.com'
              autoComplete='email'
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>
        </div>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor='phone'>Phone Number</FieldLabel>
          <Input
            id='phone'
            type='tel'
            placeholder='01XXXXXXXXX'
            autoComplete='tel'
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.address}>
          <FieldLabel htmlFor='address'>Address</FieldLabel>
          <textarea
            id='address'
            rows={3}
            className='flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary aria-invalid:border-destructive aria-invalid:ring-destructive/20'
            placeholder='House, Road, Area, Village...'
            aria-invalid={!!errors.address}
            {...register('address')}
          />
          {errors.address && <FieldError>{errors.address.message}</FieldError>}
        </Field>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field data-invalid={!!errors.upzila}>
            <FieldLabel htmlFor='upzila'>Upzila / Thana</FieldLabel>
            <Input
              id='upzila'
              placeholder='Mirpur, Sadar, etc.'
              aria-invalid={!!errors.upzila}
              {...register('upzila')}
            />
            {errors.upzila && <FieldError>{errors.upzila.message}</FieldError>}
          </Field>
          <Field data-invalid={!!errors.postalCode}>
            <FieldLabel htmlFor='postalCode'>Postal Code (optional)</FieldLabel>
            <Input
              id='postalCode'
              placeholder='1205'
              autoComplete='postal-code'
              aria-invalid={!!errors.postalCode}
              {...register('postalCode')}
            />
            {errors.postalCode && (
              <FieldError>{errors.postalCode.message}</FieldError>
            )}
          </Field>
        </div>

        <Field data-invalid={!!errors.district}>
          <FieldLabel htmlFor='district'>District</FieldLabel>
          <SearchableSelect
            options={BD_DISTRICTS}
            value={formValues.district}
            onChange={(value) =>
              setValue('district', value, { shouldValidate: true })
            }
            placeholder='Select district...'
            searchPlaceholder='Search district...'
            emptyMessage='No district found'
          />
          {errors.district && (
            <FieldError>{errors.district.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='comment'>Delivery Note (optional)</FieldLabel>
          <textarea
            id='comment'
            rows={2}
            className='flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            placeholder='Any special instructions for delivery?'
            {...register('comment')}
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
