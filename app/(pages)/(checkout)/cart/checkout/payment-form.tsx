'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { type PaymentFormData, paymentSchema } from './checkout-schema';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  onBack: () => void;
  defaultValues?: Partial<PaymentFormData>;
}

const paymentMethods = [
  {
    value: 'bkash',
    label: 'bKash',
    description: 'Pay with bKash mobile wallet',
  },
  {
    value: 'nagad',
    label: 'Nagad',
    description: 'Pay with Nagad mobile wallet',
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order',
  },
] as const;

export function PaymentForm({
  onSubmit,
  onBack,
  defaultValues,
}: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'bkash',
      ...defaultValues,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Wallet className='h-5 w-5' />
          Payment Method
        </CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='method'
              render={({ field }) => (
                <FormItem className='space-y-4'>
                  <FormLabel>Select payment method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='space-y-3'
                    >
                      {paymentMethods.map((method) => (
                        <div
                          key={method.value}
                          className='flex items-center space-x-3 rounded-lg border p-4'
                        >
                          <RadioGroupItem
                            value={method.value}
                            id={method.value}
                          />
                          <div className='flex-1'>
                            <label
                              htmlFor={method.value}
                              className='cursor-pointer'
                            >
                              <div className='font-medium'>{method.label}</div>
                              <div className='text-muted-foreground text-sm'>
                                {method.description}
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-between'>
              <Button variant='outline' type='button' onClick={onBack}>
                Back
              </Button>
              <Button type='submit' className='flex items-center gap-2'>
                Review Order
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
