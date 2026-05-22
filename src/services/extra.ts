import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

// --- ShopFollow ---
type ShopFollowItem = {
  id: string;
  shopId: string;
  shop: { id: string; name: string; slug: string; logoUrl: string | null };
  createdAt: string;
};

export function useFollowedShops() {
  return useQuery<ShopFollowItem[]>({
    queryKey: ['followed-shops'],
    queryFn: async () => {
      const r = await apiClient.get<{ follows: ShopFollowItem[] }>(
        '/api/shop/follow/list',
      );
      return r.data.follows;
    },
  });
}

export function useToggleFollowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shopId: string) => {
      const r = await apiClient.post<{ following: boolean }>(
        '/api/shop/follow/toggle',
        { shopId },
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-shops'] });
    },
  });
}

// --- UserAddress ---
export type UserAddress = {
  id: string;
  userId: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  upzila: string;
  district: string;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
};

export function useAddresses() {
  return useQuery<UserAddress[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const r = await apiClient.get<{ addresses: UserAddress[] }>(
        '/api/addresses/list',
      );
      return r.data.addresses;
    },
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserAddress>) => {
      const r = await apiClient.post<{ address: UserAddress }>(
        '/api/addresses/create',
        data,
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address added');
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserAddress> & { id: string }) => {
      const r = await apiClient.put<{ address: UserAddress }>(
        '/api/addresses/edit',
        data,
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated');
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete('/api/addresses/delete', { params: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted');
    },
  });
}

// --- ProductReport ---
