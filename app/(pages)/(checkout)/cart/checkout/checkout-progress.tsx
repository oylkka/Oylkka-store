import { Progress } from '@/components/ui/progress';

import { stepProgressMap } from './checkout-constants';
import type { CheckoutStep } from './checkout-type';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="mb-8">
      <h1 className="mb-4 text-3xl font-bold">Checkout</h1>
      <Progress value={stepProgressMap[currentStep]} className="h-2" />

      <div className="text-muted-foreground mt-3 flex justify-between text-sm">
        <span
          className={
            currentStep === 'information' ? 'text-primary font-medium' : ''
          }
        >
          Information
        </span>
        <span
          className={
            currentStep === 'shipping' ? 'text-primary font-medium' : ''
          }
        >
          Shipping
        </span>
        <span
          className={
            currentStep === 'payment' ? 'text-primary font-medium' : ''
          }
        >
          Payment
        </span>
        <span
          className={currentStep === 'review' ? 'text-primary font-medium' : ''}
        >
          Review
        </span>
      </div>
    </div>
  );
}
