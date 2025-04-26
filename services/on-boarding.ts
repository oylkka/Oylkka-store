'use client';

import { OnboardingFormValues } from '@/lib/schema';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

async function submitOnboardingData(data: OnboardingFormValues): Promise<any> {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      // Convert non-File values to strings
      formData.append(key, value instanceof File ? value : String(value));
    }
  }

  const res = await fetch('/api/auth/onboarding', {
    method: 'POST',
    body: formData,
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.message || 'Failed to submit form');
  }

  return responseData;
}

export function useOnboardingMutation(options: {
  onSuccess?: (data: any) => Promise<void> | void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: async (formData: OnboardingFormValues) => {
      return await submitOnboardingData(formData);
    },
    onSuccess: (data) => {
      toast.success('Profile completed successfully!');
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error(error.message || 'Failed to complete profile');
      if (options.onError) {
        options.onError(error);
      }
    },
  });
}
