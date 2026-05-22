import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export type ShippingZone = {
  id: string;
  shopId: string;
  name: string;
  districts: string[];
  baseCost: number;
  perItem: number;
  freeAbove: number | null;
  estDays: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function useShippingZones() {
  return useQuery<ShippingZone[]>({
    queryKey: ['shipping-zones'],
    queryFn: async () => {
      const response = await apiClient.get<{ zones: ShippingZone[] }>(
        '/api/vendor/shipping/list',
      );
      return response.data.zones;
    },
  });
}

export function useCreateShippingZoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      districts: string[];
      baseCost: number;
      perItem: number;
      freeAbove: number | null;
      estDays: string | null;
    }) => {
      const response = await apiClient.post<{ zone: ShippingZone }>(
        '/api/vendor/shipping/create',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
    },
  });
}

export function useUpdateShippingZoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ShippingZone> & { id: string }) => {
      const response = await apiClient.put<{ zone: ShippingZone }>(
        '/api/vendor/shipping/edit',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
    },
  });
}

export function useDeleteShippingZoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete('/api/vendor/shipping/delete', {
        params: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
    },
  });
}
