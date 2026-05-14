import { QUERY_KEYS } from '@/lib/constants';
import type { BannerFormType } from '@/schemas/banner-schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

type HeroBanner = {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  image: { url: string };
  bannerTag?: string;
  primaryActionText?: string;
  primaryActionLink?: string;
  secondaryActionText?: string;
  secondaryActionLink?: string;
  alignment?: 'left' | 'center' | 'right';
};

export function useHeroBanner() {
  return useQuery<HeroBanner[]>({
    queryKey: [QUERY_KEYS.HERO_BANNER],
    queryFn: async () => {
      const response = await axios.get<HeroBanner[]>('/api/banners/hero');
      return response.data;
    },
  });
}

export function useBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: BannerFormType) => {
      const formData = new FormData();

      formData.append('title', values.title);
      formData.append('subtitle', values.subtitle ?? '');
      formData.append('description', values.description ?? '');
      formData.append('bannerTag', values.bannerTag ?? '');
      formData.append('alignment', values.alignment);
      formData.append('bannerPosition', values.bannerPosition);
      formData.append('primaryActionText', values.primaryActionText ?? '');
      formData.append('primaryActionLink', values.primaryActionLink ?? '');
      formData.append('secondaryActionText', values.secondaryActionText ?? '');
      formData.append('secondaryActionLink', values.secondaryActionLink ?? '');

      if (values.startDate) {
        formData.append('startDate', values.startDate.toISOString());
      }
      if (values.endDate) {
        formData.append('endDate', values.endDate.toISOString());
      }

      if (values.image instanceof FileList && values.image.length > 0) {
        formData.append('image', values.image[0]);
      }

      const response = await axios.post<HeroBanner>(
        '/api/banners/add',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return response.data;
    },
    onMutate: () => {
      toast.loading('Creating banner...', { id: 'banner-mutation' });
    },
    onSuccess: () => {
      toast.success('Banner created successfully!', { id: 'banner-mutation' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HERO_BANNER] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to create banner';
      toast.error(`Error: ${message}`, { id: 'banner-mutation' });
    },
  });
}
