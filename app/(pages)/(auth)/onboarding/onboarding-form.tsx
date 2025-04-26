'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form } from '@/components/ui/form';
import { onboardingSchema } from '@/lib/schema';
import { useOnboardingMutation } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import FormActions from './form-actions';
import ShopInfoSection from './shop-info-section';
import UserInfoSection from './user-info-section';

type FormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingForm() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState('');
  const { data: session, update } = useSession();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      id: session?.user?.id || '',
      name: '',
      username: '',
      email: session?.user?.email || '',
      role: 'CUSTOMER',
      phone: '',
    },
    mode: 'onBlur',
  });

  const {
    mutate: submitOnboarding,
    error,
    isPending,
  } = useOnboardingMutation({
    onSuccess: async (data) => {
      // Pass all updated user data to the session
      await update({
        name: data.user.name,
        image: data.user.image,
        hasOnboarded: true,
        role: data.user.role,
        username: data.user.username,
        email: data.user.email,
      });

      // Redirect after session update
      router.push('/dashboard');
    },
  });

  const role = form.watch('role');
  const isVendor = role === 'VENDOR';

  const onSubmit = (data: FormValues) => {
    submitOnboarding({ ...data, avatar: avatarFile || undefined });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <Alert
              variant="destructive"
              className="animate-in fade-in slide-in-from-top-5 duration-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <UserInfoSection
            form={form}
            avatarSrc={avatarSrc}
            setAvatarSrc={setAvatarSrc}
            setAvatarFile={setAvatarFile}
          />
          {isVendor && <ShopInfoSection form={form} />}
          <FormActions form={form} isSubmitting={isPending} />
        </form>
      </Form>
    </div>
  );
}
