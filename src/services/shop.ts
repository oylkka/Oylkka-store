import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';
import type { ShopApplicationFormType } from '@/schemas/shop-schema';

type ShopResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  bannerUrl: string | null;
  bannerPublicId: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  status: string;
  rejectionReason: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  shippingCost: number;
  totalSales: number;
  totalOrders: number;
  rating: number;
  totalReviews: number;
};

type ShopApiResponse = {
  message: string;
  shop: ShopResponse;
};

export function useMyShop() {
  return useQuery<ShopResponse | null>({
    queryKey: [QUERY_KEYS.SHOPS, 'my-shop'],
    queryFn: async () => {
      const response = await apiClient.get<ShopResponse | null>(
        '/api/shop/my-shop',
      );
      return response.data;
    },
  });
}

export type AdminShopResponse = ShopResponse & {
  owner: {
    name: string;
    email: string;
  };
};

export function useAdminShops(status?: string, search?: string) {
  return useQuery<AdminShopResponse[]>({
    queryKey: [QUERY_KEYS.SHOPS, 'admin-list', status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const response = await apiClient.get<AdminShopResponse[]>(
        `/api/shop/admin-list?${params.toString()}`,
      );
      return response.data;
    },
  });
}

export function useShopDetail(slug: string | undefined) {
  return useQuery<AdminShopResponse>({
    queryKey: ['shop', slug],
    queryFn: async () => {
      const response = await apiClient.post<AdminShopResponse>(
        '/api/shop/get-single',
        { slug },
      );
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useApproveShopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post('/api/shop/approve', { id });
      return response.data;
    },
    onMutate: () => {
      toast.loading('Approving shop...', { id: 'shop-approve' });
    },
    onSuccess: () => {
      toast.success('Shop approved successfully!', { id: 'shop-approve' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOPS] });
    },
    onError: (error: unknown) => {
      const message = apiClient.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to approve shop';
      toast.error(`Error: ${message}`, { id: 'shop-approve' });
    },
  });
}

export function useRejectShopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      rejectionReason,
    }: {
      id: string;
      rejectionReason: string;
    }) => {
      const response = await apiClient.post('/api/shop/reject', {
        id,
        rejectionReason,
      });
      return response.data;
    },
    onMutate: () => {
      toast.loading('Rejecting shop...', { id: 'shop-reject' });
    },
    onSuccess: () => {
      toast.success('Shop rejected!', { id: 'shop-reject' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOPS] });
    },
    onError: (error: unknown) => {
      const message = apiClient.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to reject shop';
      toast.error(`Error: ${message}`, { id: 'shop-reject' });
    },
  });
}

export function useApplyShopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ShopApplicationFormType) => {
      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('description', values.description ?? '');
      formData.append('email', values.email);
      formData.append('phone', values.phone ?? '');
      formData.append('website', values.website ?? '');
      formData.append('addressLine1', values.addressLine1 ?? '');
      formData.append('addressLine2', values.addressLine2 ?? '');
      formData.append('city', values.city ?? '');
      formData.append('state', values.state ?? '');
      formData.append('country', values.country ?? '');
      formData.append('postalCode', values.postalCode ?? '');

      if (values.logo instanceof FileList && values.logo.length > 0) {
        formData.append('logo', values.logo[0]);
      }

      if (values.banner instanceof FileList && values.banner.length > 0) {
        formData.append('banner', values.banner[0]);
      }

      const response = await apiClient.post<ShopApiResponse>(
        '/api/shop/apply',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return response.data;
    },
    onMutate: () => {
      toast.loading('Submitting shop application...', {
        id: 'shop-apply',
      });
    },
    onSuccess: () => {
      toast.success('Shop application submitted successfully!', {
        id: 'shop-apply',
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOPS] });
    },
    onError: (error: unknown) => {
      const message = apiClient.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to submit shop application';
      toast.error(`Error: ${message}`, { id: 'shop-apply' });
    },
  });
}

export type PublicShopListShop = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  bannerUrl: string | null;
  rating: number;
  totalSales: number;
  totalReviews: number;
  city: string | null;
  country: string | null;
  createdAt: string;
  _count: { products: number };
};

type PublicShopListResponse = {
  shops: PublicShopListShop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function usePublicShops(params: { page?: number; search?: string }) {
  return useQuery<PublicShopListResponse>({
    queryKey: [QUERY_KEYS.SHOPS, 'public-list', params],
    queryFn: async () => {
      const response = await apiClient.get<PublicShopListResponse>(
        '/api/shop/public-list',
        { params },
      );
      return response.data;
    },
  });
}

type PublicShopProduct = {
  id: string;
  productName: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  hasVariants: boolean;
  images: { imageUrl: string }[];
  category: { id: string; name: string; slug: string };
  _count: { reviews: number };
  createdAt: string;
};

export type PublicShopDetail = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  rating: number;
  totalSales: number;
  totalReviews: number;
  createdAt: string;
  _count: { products: number };
  products: PublicShopProduct[];
  ratingBreakdown: Record<number, number>;
  recentReviews: {
    id: string;
    rating: number;
    title: string | null;
    content: string;
    createdAt: string;
    user: { id: string; name: string; image: string | null };
    product: { id: string; productName: string; slug: string };
  }[];
};

export function usePublicShop(slug: string) {
  return useQuery<PublicShopDetail>({
    queryKey: [QUERY_KEYS.SHOPS, 'public-single', slug],
    queryFn: async () => {
      const response = await apiClient.get<PublicShopDetail>(
        '/api/shop/public-single',
        { params: { slug } },
      );
      return response.data;
    },
    enabled: !!slug,
  });
}

type PublicShopProductsResponse = {
  products: PublicShopProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function usePublicShopProducts(shopSlug: string, page: number = 1) {
  return useQuery<PublicShopProductsResponse>({
    queryKey: [QUERY_KEYS.SHOPS, 'public-products', shopSlug, page],
    queryFn: async () => {
      const response = await apiClient.get<PublicShopProductsResponse>(
        '/api/shop/public-products',
        { params: { shopSlug, page, limit: 20 } },
      );
      return response.data;
    },
    enabled: !!shopSlug,
  });
}
