// app/checkout/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  Truck,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import OrderSummary from './order-summary';

// Types
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CheckoutStep = 'information' | 'shipping' | 'payment' | 'review';

// Mock data
const cartItems: CartItem[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 199.99,
    quantity: 1,
    image: '/api/placeholder/100/100',
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    price: 299.95,
    quantity: 1,
    image: '/api/placeholder/100/100',
  },
];

// Form schemas
const addressSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters' }),
  address: z
    .string()
    .min(5, { message: 'Address must be at least 5 characters' }),
  apartment: z.string().optional(),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }),
  country: z.string().min(2, { message: 'Please select a country' }),
  state: z.string().min(2, { message: 'Please select a state/province' }),
  postalCode: z
    .string()
    .min(3, { message: 'Please enter a valid postal code' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
});

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(16, { message: 'Please enter a valid card number' }),
  cardName: z.string().min(2, { message: 'Please enter the name on card' }),
  expiryDate: z
    .string()
    .min(5, { message: 'Please enter expiry date (MM/YY)' }),
  cvv: z.string().min(3, { message: 'Please enter CVV' }),
});

// Step progression mapping
const stepProgressMap: Record<CheckoutStep, number> = {
  information: 25,
  shipping: 50,
  payment: 75,
  review: 100,
};

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

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      country: 'us',
      state: '',
      postalCode: '',
      phone: '',
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    },
  });

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

  const handlePlaceOrder = () => {
    toast('Order successfully placed!');

    // Simulate order submission and redirect after 2 seconds
    setTimeout(() => {
      router.push('/cart/order-confirmation');
    }, 2000);
  };

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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={addressForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={addressForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField
                        control={addressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="us">
                                  United States
                                </SelectItem>
                                <SelectItem value="ca">Canada</SelectItem>
                                <SelectItem value="uk">
                                  United Kingdom
                                </SelectItem>
                                <SelectItem value="au">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State / Province</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={addressForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal code</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
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
                            Standard Shipping
                          </div>
                          <div className="font-bold">$4.99</div>
                        </label>
                        <p className="text-muted-foreground text-sm">
                          Delivery in 5-7 business days
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="priority" id="priority" />
                      <div className="grid flex-1 gap-1">
                        <label
                          htmlFor="priority"
                          className="flex items-center justify-between text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="flex items-center">
                            <Truck className="mr-2 h-4 w-4" />
                            Priority Shipping
                          </div>
                          <div className="font-bold">$8.99</div>
                        </label>
                        <p className="text-muted-foreground text-sm">
                          Delivery in 2-3 business days
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
                            Express Shipping
                          </div>
                          <div className="font-bold">$15.00</div>
                        </label>
                        <p className="text-muted-foreground text-sm">
                          Delivery in 1 business day
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
                        <p className="font-medium">
                          {addressData.firstName} {addressData.lastName}
                        </p>
                        <p>{addressData.address}</p>
                        {addressData.apartment && (
                          <p>{addressData.apartment}</p>
                        )}
                        <p>
                          {addressData.city}, {addressData.state}{' '}
                          {addressData.postalCode}
                        </p>
                        <p>
                          {addressData.country === 'us'
                            ? 'United States'
                            : addressData.country === 'ca'
                              ? 'Canada'
                              : addressData.country === 'uk'
                                ? 'United Kingdom'
                                : 'Australia'}
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
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Enter your payment details securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form
                    onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}
                    className="space-y-6"
                  >
                    <Tabs defaultValue="card" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="card">Credit Card</TabsTrigger>
                        <TabsTrigger value="bkash">Bkash</TabsTrigger>
                      </TabsList>
                      <TabsContent value="card">
                        <div className="space-y-4 pt-4">
                          <FormField
                            control={paymentForm.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="1234 5678 9012 3456"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={paymentForm.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name on card</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={paymentForm.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry date</FormLabel>
                                  <FormControl>
                                    <Input placeholder="MM/YY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={paymentForm.control}
                              name="cvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="bkash">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="space-y-4 text-center">
                            <p className="text-lg font-medium">
                              Bkash integration
                            </p>
                            <p className="text-muted-foreground text-sm">
                              You&#39;ll be redirected to Bkash to complete your
                              payment securely.
                            </p>
                            <Button
                              type="button"
                              className="w-full"
                              onClick={() =>
                                toast('PayPal integration would happen here')
                              }
                            >
                              Continue with Bkash
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-md mb-2 font-medium">
                        Billing address
                      </h3>
                      <div className="mb-4 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="same-address"
                          defaultChecked
                          className="text-primary focus:ring-primary rounded border-gray-300"
                        />
                        <label htmlFor="same-address" className="text-sm">
                          Same as shipping address
                        </label>
                      </div>
                    </div>

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
                        <p className="font-medium">
                          {addressData.firstName} {addressData.lastName}
                        </p>
                        <p>{addressData.address}</p>
                        {addressData.apartment && (
                          <p>{addressData.apartment}</p>
                        )}
                        <p>
                          {addressData.city}, {addressData.state}{' '}
                          {addressData.postalCode}
                        </p>
                        <p>
                          {addressData.country === 'us'
                            ? 'United States'
                            : addressData.country === 'ca'
                              ? 'Canada'
                              : addressData.country === 'uk'
                                ? 'United Kingdom'
                                : 'Australia'}
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
                        {shippingMethod === 'standard'
                          ? 'Standard Shipping'
                          : shippingMethod === 'priority'
                            ? 'Priority Shipping'
                            : 'Express Shipping'}
                      </p>
                      <p className="text-muted-foreground">
                        {shippingMethod === 'standard'
                          ? 'Delivery in 5-7 business days'
                          : shippingMethod === 'priority'
                            ? 'Delivery in 2-3 business days'
                            : 'Delivery in 1 business day'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md mb-2 font-medium">Payment Method</h3>
                    {paymentData && (
                      <div className="bg-muted rounded-md p-3 text-sm">
                        <p className="font-medium">Credit Card</p>
                        <p className="text-muted-foreground">
                          **** **** **** {paymentData.cardNumber.slice(-4)}
                        </p>
                        <p className="text-muted-foreground">
                          Expires: {paymentData.expiryDate}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-md mb-4 font-medium">Order Items</h3>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              width={200}
                              height={200}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{item.name}</h4>
                            <p className="text-muted-foreground text-sm">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
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
                      className="flex items-center"
                    >
                      Place Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <OrderSummary />
      </div>
    </div>
  );
}
