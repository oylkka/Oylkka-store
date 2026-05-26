import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  banned: boolean;
  banReason: string | null;
  imageUrl: string;
  createdAt: string;
  _count: { orders: number; reviews: number };
};

type CustomerListResponse = {
  customers: AdminCustomer[];
  total: number;
  page: number;
  totalPages: number;
};

type CustomerFilters = {
  role?: string;
  banned?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

export function useAdminCustomers(filters: CustomerFilters = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set('role', filters.role);
  if (filters.banned !== undefined)
    params.set('banned', String(filters.banned));
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery<CustomerListResponse>({
    queryKey: [QUERY_KEYS.ADMIN_CUSTOMERS, filters],
    queryFn: async () => {
      const r = await apiClient.get<CustomerListResponse>(
        `/api/admin/customers/list?${params.toString()}`,
      );
      return r.data;
    },
  });
}

type CustomerDetailResponse = {
  customer: AdminCustomer;
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  totalSpent: number;
};

export function useAdminCustomer(id: string) {
  return useQuery<CustomerDetailResponse>({
    queryKey: [QUERY_KEYS.ADMIN_CUSTOMERS, id],
    queryFn: async () => {
      const r = await apiClient.get<CustomerDetailResponse>(
        `/api/admin/customers/${id}`,
      );
      return r.data;
    },
    enabled: !!id,
  });
}

export function useBanCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      banned,
      banReason,
      banExpires,
    }: {
      id: string;
      banned: boolean;
      banReason?: string;
      banExpires?: string;
    }) => {
      const r = await apiClient.put<{ customer: AdminCustomer }>(
        `/api/admin/customers/${id}`,
        { banned, banReason, banExpires },
      );
      return r.data;
    },
    onMutate: () => {
      toast.loading('Updating customer...', { id: 'ban-customer' });
    },
    onSuccess: () => {
      toast.success('Customer updated', { id: 'ban-customer' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CUSTOMERS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to update customer';
      toast.error(message, { id: 'ban-customer' });
    },
  });
}

export function useUpdateCustomerRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const r = await apiClient.put<{ customer: AdminCustomer }>(
        `/api/admin/customers/${id}`,
        { role },
      );
      return r.data;
    },
    onMutate: () => {
      toast.loading('Changing role...', { id: 'role-customer' });
    },
    onSuccess: () => {
      toast.success('Role updated', { id: 'role-customer' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CUSTOMERS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to update role';
      toast.error(message, { id: 'role-customer' });
    },
  });
}
