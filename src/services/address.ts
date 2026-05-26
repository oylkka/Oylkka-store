import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

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
    queryKey: [QUERY_KEYS.ADDRESSES],
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADDRESSES] });
      toast.success('Address added');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to add address';
      toast.error(`Error: ${message}`);
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADDRESSES] });
      toast.success('Address updated');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to update address';
      toast.error(`Error: ${message}`);
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADDRESSES] });
      toast.success('Address deleted');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to delete address';
      toast.error(`Error: ${message}`);
    },
  });
}
