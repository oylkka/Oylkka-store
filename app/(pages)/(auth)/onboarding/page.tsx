'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { onboardingSchema } from '@/schemas';
import { useOnboardingMutation } from '@/services';

import ShopInfoSection from './shop-info-section';
import UserInfo from './user-info';

export default function InputForm() {
  const session = useSession();
  const router = useRouter();
  // Add state to track vendor role separately from form state
  const [isVendor, setIsVendor] = useState(false);

  // Initialize form with default values
  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      id: '',
      name: '',
      username: '',
      email: '',
      role: 'CUSTOMER',
      phone: '',
      shopName: '',
      shopSlug: '',
      shopCategory: '',
      shopAddress: '',
      shopDescription: '',
      shopEmail: '',
      shopPhone: '',
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        website: '',
      },
    },
  });

  // Load user data from session
  useEffect(() => {
    if (session.data?.user) {
      const userRole = session.data.user.role || 'CUSTOMER';
      form.reset({
        ...form.getValues(),
        id: session.data.user.id,
        name: session.data.user.name || '',
        email: session.data.user.email || '',
        avatar: session.data.user.image,
        role: userRole,
      });

      // Set vendor state based on user role
      setIsVendor(userRole === 'VENDOR');
    }
  }, [session.data?.user, form]);

  // Watch for role changes and update isVendor state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'role' || name === undefined) {
        const role = value.role;
        setIsVendor(role === 'VENDOR');
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // Setup mutation for form submission
  const { mutate, isPending, isError, error } = useOnboardingMutation({
    onSuccess: () => {
      // Redirect or update UI on success
      router.push('/dashboard');
    },
  });

  // Form submission handler
  function onSubmit(data: z.infer<typeof onboardingSchema>) {
    mutate(data);
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-6 text-center text-3xl font-bold'>
        Complete Your Profile
      </h1>
      <p className='text-muted-foreground mb-8 text-center'>
        Please provide your information to get started
      </p>

      {isError && (
        <Alert variant='destructive' className='mb-6'>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message ||
              'There was an error saving your profile. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='container mx-auto max-w-5xl space-y-8'
        >
          <UserInfo />

          {isVendor && <ShopInfoSection />}

          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button
              type='submit'
              disabled={isPending}
              className='min-w-[120px]'
            >
              {isPending ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Saving...
                </span>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
