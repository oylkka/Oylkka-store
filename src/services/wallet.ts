import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { TransactionType } from '@/generated/prisma/enums';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

type WalletTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  reference: string | null;
  orderId: string | null;
  description: string | null;
  createdAt: string;
};

type Wallet = {
  id: string;
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
  createdAt: string;
  updatedAt: string;
};

export function useWallet() {
  return useQuery<Wallet>({
    queryKey: [QUERY_KEYS.WALLET],
    queryFn: async () => {
      const response = await apiClient.get<Wallet>('/api/wallet/get');
      return response.data;
    },
  });
}

export function useTopUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiClient.post('/api/wallet/top-up', { amount });
      return response.data;
    },
    onMutate: () => {
      toast.loading('Processing top-up...', { id: 'wallet-topup' });
    },
    onSuccess: () => {
      toast.success('Wallet topped up successfully!', { id: 'wallet-topup' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLET] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      const msg = error.response?.data?.error || 'Failed to top up wallet';
      toast.error(msg, { id: 'wallet-topup' });
    },
  });
}
