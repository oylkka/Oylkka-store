import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReturnReason, ReturnStatus } from '@/generated/prisma/enums';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

type ReturnRequestItem = {
  id: string;
  orderId: string;
  itemIds: string[];
  customerId: string;
  shopId: string;
  reason: ReturnReason;
  details: string | null;
  images: string[];
  status: ReturnStatus;
  resolution: string | null;
  refundAmount: number | null;
  adminNote: string | null;
  customerTrackingNumber: string | null;
  customerTrackingUrl: string | null;
  returnLabelUrl: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderNumber: string;
    items?: {
      id: string;
      productName: string;
      imageUrl: string | null;
      quantity: number;
      unitPrice: number;
    }[];
  };
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  shop?: {
    id: string;
    name: string;
  };
};

// Customer hooks
export function useMyReturns() {
  return useQuery<ReturnRequestItem[]>({
    queryKey: ['my-returns'],
    queryFn: async () => {
      const response = await apiClient.get<{ returns: ReturnRequestItem[] }>(
        '/api/returns/list',
      );
      return response.data.returns;
    },
  });
}

export function useReturnDetail(returnId: string | undefined) {
  return useQuery<ReturnRequestItem>({
    queryKey: ['return-detail', returnId],
    queryFn: async () => {
      const response = await apiClient.get<{ return: ReturnRequestItem }>(
        `/api/returns/${returnId}`,
      );
      return response.data.return;
    },
    enabled: !!returnId,
  });
}

export function useCreateReturnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<{
        returnRequest: ReturnRequestItem;
      }>('/api/returns/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-returns'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    },
  });
}

// Vendor hooks

// Admin hooks
