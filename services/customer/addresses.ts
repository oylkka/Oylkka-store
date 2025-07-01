import { QEUERY_KEYS } from '@/lib/constants';
import {
  AddressFormValues,
  EditAddressFormValues,
} from '@/schemas/addressesSchema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddressFormValues) => {
      const response = await axios.post(
        '/api/dashboard/customer/profile/addresses',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QEUERY_KEYS.USER_ADDRESSES],
      });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await axios.delete(
        `/api/dashboard/customer/profile/addresses?addressId=${addressId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QEUERY_KEYS.USER_ADDRESSES],
      });
    },
  });
};

export function useAddress() {
  return useQuery({
    queryKey: [QEUERY_KEYS.USER_ADDRESSES],
    queryFn: async () => {
      const { data } = await axios.get(
        '/api/dashboard/customer/profile/addresses'
      );
      return data;
    },
  });
}

export function useSingleAddress({ id }: { id: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.SINGLE_ADDRESS],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/dashboard/customer/profile/addresses/single-address?id=${id}`
      );
      return data;
    },
  });
}

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: EditAddressFormValues;
    }) => {
      const response = await axios.put(
        `/api/dashboard/customer/profile/addresses/single-address?id=${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QEUERY_KEYS.USER_ADDRESSES],
      });
    },
  });
};
