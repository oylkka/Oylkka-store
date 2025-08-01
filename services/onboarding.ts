'use client';

import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { cleanFormData } from '@/lib/utils';
import type { OnboardingFormValues } from '@/schemas';

// Function to handle file and non-file form data
function prepareFormData(data: OnboardingFormValues): FormData {
  const formData = new FormData();
  const cleanedData = cleanFormData(data);

  // Handle flat fields
  for (const [key, value] of Object.entries(cleanedData)) {
    if (key === 'socialLinks' || value === undefined || value === null) {
      continue;
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      // Skip objects for now
    } else {
      formData.append(key, String(value));
    }
  }

  // Handle social links separately
  if (cleanedData.socialLinks) {
    for (const [platform, url] of Object.entries(cleanedData.socialLinks)) {
      if (url && typeof url === 'string' && url.trim() !== '') {
        formData.append(`socialLinks[${platform}]`, url);
      }
    }
  }

  return formData;
}

// Function to submit onboarding data to the API
// biome-ignore lint: error
async function submitOnboardingData(data: OnboardingFormValues): Promise<any> {
  const formData = prepareFormData(data);

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

// Hook to use the onboarding mutation
export function useOnboardingMutation(options: {
  // biome-ignore lint: error
  onSuccess?: (data: any) => Promise<void> | void;
  onError?: (error: Error) => void;
}) {
  const { update } = useSession();
  return useMutation({
    mutationFn: submitOnboardingData,
    onMutate: () => {
      // Show loading toast before starting the mutation
      toast.loading('Saving profile...', { id: 'onboarding' });
    },
    onSuccess: async (data) => {
      await update({
        name: data.data.name,
        username: data.data.username,
        role: data.data.role,
        image: data.data.image,
        hasOnboarded: data.data.hasOnboarded,
      });
      toast.success('Profile completed successfully!', { id: 'onboarding' });
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete profile', {
        id: 'onboarding',
      });
      if (options.onError) {
        options.onError(error);
      }
    },
  });
}
