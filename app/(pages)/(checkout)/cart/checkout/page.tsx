'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCheckoutCalculations } from '@/app/(pages)/(checkout)/cart/checkout/use-checkout-calculations';
import { useUserCart } from '@/services';

import { AddressForm } from './address-form';
import { CheckoutProgress } from './checkout-progress';
import type { AddressFormData, PaymentFormData } from './checkout-schema';
import type {
  AddressData,
  CheckoutStep,
  OrderData,
  PaymentData,
} from './checkout-type';
import { OrderReview } from './order-review';
import OrderSummary from './order-summary';
import { PaymentForm } from './payment-form';
import { ShippingForm } from './shipping-form';

// Import your existing OrderSummary component

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>('information');
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string>('standard');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  const { isPending, data: cartData, isError, refetch } = useUserCart();

  const { subtotal, shippingCost, discountAmount, total } =
    useCheckoutCalculations({
      cartItems: cartData || [],
      shippingMethod,
      promoCode,
      discount,
    });

  const handleAddressSubmit = (data: AddressFormData) => {
    setAddressData(data);
    setStep('shipping');
    window.scrollTo(0, 0);
  };

  const handleShippingSubmit = () => {
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = (data: PaymentFormData) => {
    setPaymentData(data);
    setStep('review');
    window.scrollTo(0, 0);
  };

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

      const orderData: OrderData = {
        cart: cartData,
        shipping: {
          address: addressData,
          method: shippingMethod,
          cost: shippingCost,
          freeShippingApplied: shippingCost === 0,
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

      const response = await axios.post('/api/checkout/payment', orderData);

      if (response.status === 501) {
        toast.error('Payment gateway is not configured');
        return;
      }

      if (response.data.url) {
        refetch();
        router.push(response.data.url);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (isError || !cartData) {
    return (
      <div className="container mx-auto flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2 text-lg font-medium">
            Failed to load cart data
          </p>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (cartData.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-lg font-medium">Your cart is empty</p>
          <p className="text-muted-foreground">
            Add some items to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <CheckoutProgress currentStep={step} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 'information' && (
            <AddressForm
              onSubmit={handleAddressSubmit}
              email={session?.user?.email ?? ''}
            />
          )}

          {step === 'shipping' && addressData && (
            <ShippingForm
              selectedMethod={shippingMethod}
              onMethodChange={setShippingMethod}
              onSubmit={handleShippingSubmit}
              onBack={() => setStep('information')}
              addressData={addressData}
              subtotal={subtotal}
              promoCode={promoCode}
            />
          )}

          {step === 'payment' && (
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              onBack={() => setStep('shipping')}
            />
          )}

          {step === 'review' && addressData && paymentData && (
            <OrderReview
              cartItems={cartData}
              addressData={addressData}
              shippingMethod={shippingMethod}
              paymentData={paymentData}
              subtotal={subtotal}
              shippingCost={shippingCost}
              discount={discount}
              discountAmount={discountAmount}
              promoCode={promoCode}
              total={total}
              onBack={() => setStep('payment')}
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <OrderSummary
            cartItems={cartData}
            shippingCost={shippingCost}
            onPromoCodeApplied={handlePromoCodeUpdate}
          />
        </div>
      </div>
    </div>
  );
}

