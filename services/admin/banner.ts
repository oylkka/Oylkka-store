import { QEUERY_KEYS } from '@/lib/constants';
import { cleanFormData } from '@/lib/utils';
import { BannerFormSchema } from '@/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';

export type BannerFormValues = z.infer<typeof BannerFormSchema>;

export function useBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: BannerFormValues) => {
      const cleanedValues = cleanFormData(values);
      const formData = new FormData();

      Object.entries(cleanedValues).forEach(([key, value]) => {
        if (key === 'image' && value && value[0]) {
          formData.append('image', value[0]);
        } else if ((key === 'startDate' || key === 'endDate') && value) {
          formData.append(key, value.toISOString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/dashboard/admin/banners', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create banner');
      }

      return response.json();
    },

    onSuccess: () => {
      toast.success('Banner created successfully!');
      queryClient.invalidateQueries({ queryKey: [QEUERY_KEYS.HERO_BANNER] });
    },

    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Failed to create banner'}`);
    },

    onMutate: () => {
      toast.loading('Creating banner...');
    },
  });
}
