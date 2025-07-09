import { QUERY_KEYS } from '@/lib/constants';
import { cleanFormData } from '@/lib/utils';
import { BannerFormSchema, EditBannerFormType } from '@/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HERO_BANNER] });
    },

    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Failed to create banner'}`);
    },

    onMutate: () => {
      toast.loading('Creating banner...');
    },
  });
}

export function useAdminBannerList() {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BANNER_LIST],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/admin/banners');
      return response.json();
    },
  });
}

export function useSingleBanner({ id }: { id: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.SINGLE_BANNER, id],
    queryFn: async () => {
      const response = await fetch(
        `/api/dashboard/admin/banners/single-banner?id=${id}`
      );
      return response.json();
    },
  });
}

interface UpdateBannerVariables {
  id: string;
  data: FormData;
}

import axios from 'axios';

interface UpdateBannerVariables {
  id: string;
  data: FormData;
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateBannerVariables) => {
      const response = await axios.put(
        `/api/dashboard/admin/banners/single-banner?id=${id}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SINGLE_BANNER, variables.id],
      });
      toast.success('Banner updated successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update banner');
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
}

export function prepareFormData(
  values: EditBannerFormType,
  id: string
): FormData {
  const formData = new FormData();
  const cleanedValues = cleanFormData(values);

  // Add the banner ID
  formData.append('id', id);

  // Add text fields
  if (cleanedValues.title) formData.append('title', cleanedValues.title);
  if (cleanedValues.subtitle)
    formData.append('subTitle', cleanedValues.subtitle);
  if (cleanedValues.description)
    formData.append('description', cleanedValues.description);
  if (cleanedValues.bannerTag)
    formData.append('bannerTag', cleanedValues.bannerTag);

  // Add action buttons
  if (cleanedValues.primaryActionText)
    formData.append('primaryActionText', cleanedValues.primaryActionText);
  if (cleanedValues.primaryActionLink)
    formData.append('primaryActionLink', cleanedValues.primaryActionLink);
  if (cleanedValues.secondaryActionText)
    formData.append('secondaryActionText', cleanedValues.secondaryActionText);
  if (cleanedValues.secondaryActionLink)
    formData.append('secondaryActionLink', cleanedValues.secondaryActionLink);

  // Add display settings
  if (cleanedValues.alignment)
    formData.append('alignment', cleanedValues.alignment);
  if (cleanedValues.bannerPosition)
    formData.append('bannerPosition', cleanedValues.bannerPosition);

  // Add dates
  if (cleanedValues.startDate)
    formData.append('startDate', cleanedValues.startDate.toISOString());
  if (cleanedValues.endDate)
    formData.append('endDate', cleanedValues.endDate.toISOString());

  // Handle image upload
  if (cleanedValues.image && cleanedValues.image.length > 0) {
    formData.append('image', cleanedValues.image[0]);
    formData.append('keepExistingImage', 'false');
  } else if (
    values.hasExistingImage &&
    values.keepExistingImage !== undefined
  ) {
    formData.append('keepExistingImage', values.keepExistingImage.toString());
  }

  return formData;
}

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const deletePromise = axios
        .delete<{
          message: string;
        }>(`/api/dashboard/admin/banners/single-banner?id=${id}`)
        .then((res) => res.data); // Unwrap response before passing to toast

      return toast.promise(deletePromise, {
        loading: 'Deleting design...',
        success: (data) => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.ADMIN_BANNER_LIST],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.HERO_BANNER],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.SINGLE_BANNER],
          });
          return data.message || 'Design deleted successfully ✅';
        },
        error: (error) =>
          axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to delete design ❌'
            : 'Something went wrong. Please try again.',
      });
    },
  });
};
