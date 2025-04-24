'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
  Check,
  ChevronRight,
  MapPin,
  Package,
  Truck,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUserCart } from '@/service';

import OrderSummary from './order-summary';

// Types
type CheckoutStep = 'information' | 'shipping' | 'payment' | 'review';

interface CartItem {
  id: string;
  productName: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  imageUrl?: string;
}

interface ShippingOption {
  name: string;
  cost: number;
  description: string;
}

// Form schemas
const addressSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  address: z
    .string()
    .min(5, { message: 'Address must be at least 5 characters' }),
  apartment: z.string().optional(),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }),
  district: z.string().min(2, { message: 'Please select a state/province' }),
  postalCode: z
    .string()
    .min(3, { message: 'Please enter a valid postal code' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
});

const paymentSchema = z.object({
  method: z.enum(['bkash', 'nagad', 'cod']),
});

// Step progression mapping
const stepProgressMap: Record<CheckoutStep, number> = {
  information: 25,
  shipping: 50,
  payment: 75,
  review: 100,
};

// Shipping options
const shippingOptions: Record<string, ShippingOption> = {
  standard: {
    name: 'Standard Shipping',
    cost: 120,
    description: 'Delivery in 3-5 business days',
  },
  express: {
    name: 'Express Shipping',
    cost: 250,
    description: 'Delivery in 1-2 business days',
  },
};

// Free shipping threshold
const SHIPPING_THRESHOLD = 2000;

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>('information');
  const [addressData, setAddressData] = useState<z.infer<
    typeof addressSchema
  > | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string>('standard');
  const [paymentData, setPaymentData] = useState<z.infer<
    typeof paymentSchema
  > | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const { isPending, data: cartData, isError } = useUserCart();

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      apartment: '',
      city: '',
      district: '',
      postalCode: '',
      phone: '',
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'bkash',
    },
  });

  // Calculate subtotal from cart items
  const calculateSubtotal = () => {
    if (!cartData) {
      return 0;
    }
    return cartData.reduce((acc: number, item: CartItem) => {
      const price = item.discountPrice ?? item.price;
      return acc + price * item.quantity;
    }, 0);
  };

  // Calculate shipping cost based on subtotal
  const calculateShippingCost = () => {
    const subtotal = calculateSubtotal();
    // Free shipping for standard if promo code is FREESHIP or if subtotal is above threshold
    if (
      (promoCode === 'FREESHIP' && shippingMethod === 'standard') ||
      (subtotal >= SHIPPING_THRESHOLD && shippingMethod === 'standard')
    ) {
      return 0; // Free standard shipping
    }
    return shippingOptions[shippingMethod].cost;
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  // Calculate total order amount
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = calculateShippingCost();
    const discountAmount = calculateDiscountAmount();
    return subtotal + shippingCost - discountAmount;
  };

  const onAddressSubmit = (data: z.infer<typeof addressSchema>) => {
    setAddressData(data);
    setStep('shipping');
    window.scrollTo(0, 0);
  };

  const onShippingSubmit = () => {
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const onPaymentSubmit = (data: z.infer<typeof paymentSchema>) => {
    setPaymentData(data);
    setStep('review');
    window.scrollTo(0, 0);
  };

  // Handle promo code from OrderSummary
  const handlePromoCodeUpdate = (code: string, discountPercent: number) => {
    setPromoCode(code);
    setDiscount(discountPercent);
  };

  const handlePlaceOrder = async () => {
    if (!cartData || !addressData || !paymentData) {
      toast.error('Missing required information');
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate all the price values
      const subtotal = calculateSubtotal();
      const shippingCost = calculateShippingCost();
      const discountAmount = calculateDiscountAmount();
      const total = calculateTotal();

      // Construct order data with all the required information
      const orderData = {
        cart: cartData,
        shipping: {
          address: addressData,
          method: shippingMethod,
          cost: shippingCost,
          // Add note if free shipping was applied
          freeShippingApplied:
            (shippingMethod === 'standard' && shippingCost === 0) ||
            promoCode === 'FREESHIP',
        },
        payment: paymentData,
        pricing: {
          subtotal,
          shippingCost,
          discount: {
            code: promoCode,
            percentage: discount,
            amount: discountAmount,
          },
          total,
        },
      };

      // Call API with axios
      const response = await axios.post('/api/checkout/payment', orderData);

      if (response.data.url) {
        router.push(response.data.url);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-8 text-center">
        Loading your cart...
      </div>
    );
  }

  if (isError || !cartData) {
    return (
      <div className="container mx-auto py-8 text-center">
        Failed to load cart data. Please try again.
      </div>
    );
  }

  if (cartData.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        Your cart is empty.
      </div>
    );
  }

  // Get actual shipping cost that will be charged (accounting for free shipping)
  const actualShippingCost = calculateShippingCost();

  // Check if free shipping is applied
  const isFreeShipping =
    (shippingMethod === 'standard' &&
      calculateSubtotal() >= SHIPPING_THRESHOLD) ||
    promoCode === 'FREESHIP';

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Checkout</h1>
        <Progress value={stepProgressMap[step]} className="h-2" />

        <div className="text-muted-foreground mt-2 flex justify-between text-sm">
          <span
            className={step === 'information' ? 'text-primary font-medium' : ''}
          >
            Information
          </span>
          <span
            className={step === 'shipping' ? 'text-primary font-medium' : ''}
          >
            Shipping
          </span>
          <span
            className={step === 'payment' ? 'text-primary font-medium' : ''}
          >
            Payment
          </span>
          <span className={step === 'review' ? 'text-primary font-medium' : ''}>
            Review
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Information Step */}
          {step === 'information' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Contact & Shipping Information
                </CardTitle>
                <CardDescription>
                  Enter your contact details and shipping address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...addressForm}>
                  <form
                    onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={addressForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Input your name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your.email@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+88 01234567890" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Full address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="apartment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Apartment, suite, etc. (optional)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Jhenaidah sadar" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Jhenaidah" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="7300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="flex items-center">
                        Continue to shipping{' '}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Shipping Step */}
          {step === 'shipping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Shipping Method
                </CardTitle>
                <CardDescription>
                  Select your preferred shipping method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onShippingSubmit();
                  }}
                  className="space-y-6"
                >
                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={setShippingMethod}
                    className="grid gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <div className="grid flex-1 gap-1">
                        <label
                          htmlFor="standard"
                          className="flex items-center justify-between text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            {shippingOptions.standard.name}
                            {(calculateSubtotal() >= SHIPPING_THRESHOLD ||
                              promoCode === 'FREESHIP') && (
                              <span className="ml-2 text-xs font-medium text-green-600">
                                (Free)
                              </span>
                            )}
                          </div>
                          <div className="font-bold">
                            {calculateSubtotal() >= SHIPPING_THRESHOLD ||
                            promoCode === 'FREESHIP' ? (
                              <div className="flex items-center">
                                <span className="mr-2 text-gray-400 line-through">
                                  ৳{shippingOptions.standard.cost}
                                </span>
                                <span className="text-green-600">Free</span>
                              </div>
                            ) : (
                              <span>৳{shippingOptions.standard.cost}</span>
                            )}
                          </div>
                        </label>
                        <p className="text-muted-foreground text-sm">
                          {shippingOptions.standard.description}
                          {calculateSubtotal() >= SHIPPING_THRESHOLD && (
                            <span className="ml-2 text-green-600">
                              Free for orders over ৳{SHIPPING_THRESHOLD}
                            </span>
                          )}
                          {promoCode === 'FREESHIP' && (
                            <span className="ml-2 text-green-600">
                              Free with promo code
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="express" id="express" />
                      <div className="grid flex-1 gap-1">
                        <label
                          htmlFor="express"
                          className="flex items-center justify-between text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="flex items-center">
                            <Truck className="mr-2 h-4 w-4" />
                            {shippingOptions.express.name}
                          </div>
                          <div className="font-bold">
                            ৳{shippingOptions.express.cost}
                          </div>
                        </label>
                        <p className="text-muted-foreground text-sm">
                          {shippingOptions.express.description}
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-md mb-2 font-medium">
                      Delivery Address
                    </h3>
                    {addressData && (
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{addressData.name}</p>
                        <p>{addressData.address}</p>
                        {addressData.apartment && (
                          <p>{addressData.apartment}</p>
                        )}
                        <p>
                          {addressData.city}, {addressData.district}{' '}
                          {addressData.postalCode}
                        </p>
                        <p>{addressData.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setStep('information')}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex items-center">
                      Continue to payment
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Choose your payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form
                    onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={paymentForm.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Select payment method</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-wrap gap-6"
                            >
                              <FormItem className="flex items-center space-y-0 space-x-3">
                                <FormControl>
                                  <RadioGroupItem value="bkash" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  bKash
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-y-0 space-x-3">
                                <FormControl>
                                  <RadioGroupItem value="nagad" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Nagad
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-y-0 space-x-3">
                                <FormControl>
                                  <RadioGroupItem value="cod" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Cash on Delivery
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setStep('shipping')}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex items-center">
                        Review order <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="mr-2 h-5 w-5" />
                  Review Your Order
                </CardTitle>
                <CardDescription>
                  Please review your order before completing your purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md mb-2 font-medium">
                      Shipping Information
                    </h3>
                    {addressData && (
                      <div className="bg-muted space-y-1 rounded-md p-3 text-sm">
                        <p className="font-medium">{addressData.name}</p>
                        <p>{addressData.address}</p>
                        {addressData.apartment && (
                          <p>{addressData.apartment}</p>
                        )}
                        <p>
                          {addressData.city}, {addressData.district}{' '}
                          {addressData.postalCode}
                        </p>
                        <p>{addressData.phone}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-md mb-2 font-medium">
                      Shipping Method
                    </h3>
                    <div className="bg-muted rounded-md p-3 text-sm">
                      <p className="font-medium">
                        {shippingOptions[shippingMethod].name}
                        {isFreeShipping && (
                          <span className="ml-2 text-green-600">(Free)</span>
                        )}
                      </p>
                      <p className="text-muted-foreground">
                        {shippingOptions[shippingMethod].description}
                      </p>
                      <p className="mt-1">
                        Cost:{' '}
                        {isFreeShipping ? (
                          <span className="text-green-600">
                            Free{' '}
                            {promoCode === 'FREESHIP'
                              ? '(with promo code)'
                              : `(instead of ৳${shippingOptions[shippingMethod].cost})`}
                          </span>
                        ) : (
                          <span>৳{shippingOptions[shippingMethod].cost}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md mb-2 font-medium">Payment Method</h3>
                    {paymentData && (
                      <div className="bg-muted rounded-md p-3 text-sm">
                        <p className="font-medium">
                          {paymentData.method === 'bkash'
                            ? 'bKash'
                            : paymentData.method === 'nagad'
                              ? 'Nagad'
                              : 'Cash on Delivery'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-md mb-4 font-medium">Order Items</h3>
                    <div className="space-y-4">
                      {cartData.map((item: CartItem) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image
                              src={item.imageUrl || '/api/placeholder/100/100'}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                              width={100}
                              height={100}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">
                              {item.productName}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            ৳{(item.discountPrice || item.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order summary in review step */}
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <h3 className="text-md mb-2 font-medium">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>৳{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        {isFreeShipping ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          <span>৳{actualShippingCost.toFixed(2)}</span>
                        )}
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({discount}%):</span>
                          <span>-৳{calculateDiscountAmount().toFixed(2)}</span>
                        </div>
                      )}
                      {promoCode && (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Promo code:</span>
                          <span>{promoCode}</span>
                        </div>
                      )}
                      <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                        <span>Total:</span>
                        <span>৳{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setStep('payment')}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex items-center"
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <OrderSummary
          cartItems={cartData}
          shippingCost={actualShippingCost}
          onPromoCodeApplied={handlePromoCodeUpdate}
        />
      </div>
    </div>
  );
}
