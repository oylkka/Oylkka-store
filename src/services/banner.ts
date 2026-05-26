import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  BannerFormType,
  EditBannerFormType,
} from '@/schemas/banner-schema';

type HeroBanner = {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  bannerTag?: string;
  primaryActionText?: string;
  primaryActionLink?: string;
  secondaryActionText?: string;
  secondaryActionLink?: string;
  alignment?: string;
};

export type AdminBanner = {
  id: string;
  title: string;
  subTitle: string | null;
  description: string | null;
  imageUrl: string;
  imagePublicId: string;
  bannerTag: string | null;
  alignment: string;
  bannerPosition: string;
  primaryActionText: string | null;
  primaryActionLink: string | null;
  secondaryActionText: string | null;
  secondaryActionLink: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreateBannerResponse = {
  message: string;
  banner: HeroBanner;
};

export function useHeroBanner() {
  return useQuery<HeroBanner[]>({
    queryKey: [QUERY_KEYS.HERO_BANNER],
    queryFn: async () => {
      const response = await apiClient.get<HeroBanner[]>('/api/banners/hero');
      return response.data;
    },
  });
}

export function useAdminBanners() {
  return useQuery<AdminBanner[]>({
    queryKey: [QUERY_KEYS.ADMIN_BANNERS],
    queryFn: async () => {
      const response = await apiClient.get<AdminBanner[]>(
        '/api/banners/admin-list',
      );
      return response.data;
    },
  });
}

export function useBanner(id: string | undefined) {
  return useQuery<AdminBanner>({
    queryKey: [QUERY_KEYS.ADMIN_BANNERS, id],
    queryFn: async () => {
      const response = await apiClient.get<AdminBanner>(
        '/api/banners/get-single',
        { params: { id } },
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreateBannerResponse, Error, BannerFormType>({
    mutationFn: async (values) => {
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

      const response = await apiClient.post<CreateBannerResponse>(
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_BANNERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_BANNERS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to create banner';
      toast.error(`Error: ${message}`, { id: 'banner-mutation' });
    },
  });
}

export function useDeleteBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await apiClient.post('/api/banners/delete', { id });
      return response.data;
    },
    onMutate: () => {
      toast.loading('Deleting banner...', { id: 'delete-banner' });
    },
    onSuccess: () => {
      toast.success('Banner deleted successfully!', { id: 'delete-banner' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_BANNERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HERO_BANNER] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_BANNERS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to delete banner';
      toast.error(`Error: ${message}`, { id: 'delete-banner' });
    },
  });
}

export function useEditBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, EditBannerFormType & { id: string }>({
    mutationFn: async (values) => {
      const formData = new FormData();

      formData.append('id', values.id);
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

      formData.append(
        'keepExistingImage',
        String(values.keepExistingImage ?? false),
      );

      const response = await apiClient.post('/api/banners/edit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    },
    onMutate: () => {
      toast.loading('Updating banner...', { id: 'edit-banner' });
    },
    onSuccess: () => {
      toast.success('Banner updated successfully!', { id: 'edit-banner' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_BANNERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HERO_BANNER] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_BANNERS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to update banner';
      toast.error(`Error: ${message}`, { id: 'edit-banner' });
    },
  });
}
