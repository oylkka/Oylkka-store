import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
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
    queryKey: [QUERY_KEYS.RETURNS],
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
    queryKey: [QUERY_KEYS.RETURNS, 'detail', returnId],
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RETURNS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to create return';
      toast.error(`Error: ${message}`);
    },
  });
}

// Vendor hooks
export function useVendorReturns() {
  return useQuery<ReturnRequestItem[]>({
    queryKey: [QUERY_KEYS.RETURNS, 'vendor'],
    queryFn: async () => {
      const r = await apiClient.get<{ returns: ReturnRequestItem[] }>(
        '/api/vendor/returns/list',
      );
      return r.data.returns;
    },
  });
}

export function useReviewReturnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      returnId: string;
      status: string;
      adminNote?: string;
    }) => {
      const r = await apiClient.post<{ return: ReturnRequestItem }>(
        '/api/vendor/returns/review',
        data,
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RETURNS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to review return';
      toast.error(`Error: ${message}`);
    },
  });
}

// Admin hooks
export function useAdminReturns(status?: string) {
  return useQuery<ReturnRequestItem[]>({
    queryKey: [QUERY_KEYS.RETURNS, 'admin', status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const r = await apiClient.get<{ returns: ReturnRequestItem[] }>(
        `/api/admin/returns/list${params}`,
      );
      return r.data.returns;
    },
  });
}

export function useAdminReviewReturnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      returnId: string;
      status: string;
      refundAmount?: number;
      adminNote?: string;
    }) => {
      const r = await apiClient.post<{ return: ReturnRequestItem }>(
        '/api/admin/returns/review',
        data,
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RETURNS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to process return';
      toast.error(`Error: ${message}`);
    },
  });
}
