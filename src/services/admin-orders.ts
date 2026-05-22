import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string | null;
  status: string;
  itemCount: number;
  createdAt: string;
  firstItemImage: string | null;
};

export type AdminOrderItem = {
  id: string;
  productId: string;
  productName: string;
  variantName: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  discountPrice: number | null;
  total: number;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  shopId: string;
  shopName: string;
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentRef: string | null;
  total: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  couponDiscount: number | null;
  couponCode: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingUpzila: string;
  shippingDistrict: string;
  shippingPostalCode: string | null;
  shippingComment: string | null;
  createdAt: string;
  confirmedAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  refundedAt: string | null;
  currency: string;
  bkashPaymentID: string | null;
  bkashTrxID: string | null;
  items: AdminOrderItem[];
};

export type AdminOrderListResponse = {
  orders: AdminOrderListItem[];
  total: number;
  totalRevenue: number;
  pendingCount: number;
  page: number;
  totalPages: number;
};

type FulfillPayload = {
  itemId: string;
  fulfillmentStatus: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

type RefundPayload = {
  orderId: string;
  amount: number;
  reason: string;
  itemIds?: string[];
};

export function useAdminOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  customer?: string;
  vendor?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<AdminOrderListResponse>({
    queryKey: [QUERY_KEYS.ADMIN_ORDERS, 'list', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.paymentStatus)
        params.set('paymentStatus', filters.paymentStatus);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.customer) params.set('customer', filters.customer);
      if (filters?.vendor) params.set('vendor', filters.vendor);
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.set('dateTo', filters.dateTo);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));
      const qs = params.toString();
      const response = await apiClient.get<AdminOrderListResponse>(
        `/api/orders/admin-list${qs ? `?${qs}` : ''}`,
      );
      return response.data;
    },
  });
}

export function useAdminOrderDetail(orderId: string) {
  return useQuery<AdminOrderDetail>({
    queryKey: [QUERY_KEYS.ADMIN_ORDERS, 'detail', orderId],
    queryFn: async () => {
      const response = await apiClient.get<AdminOrderDetail>(
        `/api/orders/admin-single?orderId=${orderId}`,
      );
      return response.data;
    },
    enabled: !!orderId,
  });
}

export function useAdminFulfillMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, FulfillPayload>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/orders/admin-fulfill', {
        orderId,
        ...payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_ORDERS],
      });
    },
  });
}

export function useAdminCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { orderId: string; reason: string }>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/orders/admin-cancel', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_ORDERS],
      });
    },
  });
}

export function useAdminRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation<AdminOrderDetail, Error, RefundPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<AdminOrderDetail>(
        '/api/orders/admin-refund',
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_ORDERS],
      });
    },
  });
}
