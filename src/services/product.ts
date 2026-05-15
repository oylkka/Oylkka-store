import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/constants';

export type ProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  imagePublicId: string;
  altText: string | null;
  order: number;
};

export type VendorProduct = {
  id: string;
  productName: string;
  slug: string;
  description: string;
  categoryId: string;
  category: { id: string; name: string };
  tags: string[];
  sku: string;
  brand: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  hasVariants: boolean;
  condition: string;
  conditionDescription: string | null;
  weight: number | null;
  weightUnit: string;
  freeShipping: boolean;
  dimensionLength: number | null;
  dimensionWidth: number | null;
  dimensionHeight: number | null;
  dimensionUnit: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  images: ProductImage[];
  status: string;
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { reviews: number; orderItems: number };
};

export type VendorCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

type CreateProductResponse = {
  message: string;
  product: VendorProduct;
};

export function useVendorProducts() {
  return useQuery<VendorProduct[]>({
    queryKey: [QUERY_KEYS.PRODUCTS, 'vendor-list'],
    queryFn: async () => {
      const response = await axios.get<VendorProduct[]>(
        '/api/product/vendor-list',
      );
      return response.data;
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<VendorProduct>({
    queryKey: [QUERY_KEYS.PRODUCTS, id],
    queryFn: async () => {
      const response = await axios.post<VendorProduct>(
        '/api/product/get-single',
        { id },
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useVendorCategories() {
  return useQuery<VendorCategory[]>({
    queryKey: [QUERY_KEYS.CATEGORIES, 'vendor'],
    queryFn: async () => {
      const response = await axios.get<VendorCategory[]>(
        '/api/product/vendor-categories',
      );
      return response.data;
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post('/api/product/delete', { id });
      return response.data;
    },
    onMutate: () => {
      toast.loading('Deleting product...', { id: 'product-delete' });
    },
    onSuccess: () => {
      toast.success('Product deleted successfully!', {
        id: 'product-delete',
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to delete product';
      toast.error(`Error: ${message}`, { id: 'product-delete' });
    },
  });
}

// New FormData-based mutations for the modular form
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post<CreateProductResponse>(
        '/api/product/create',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
}

export function useUpdateProduct({ productId }: { productId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      formData.append('id', productId);
      const response = await axios.post<CreateProductResponse>(
        '/api/product/edit',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTS, productId],
      });
    },
  });
}

export function useAdminUpdateProduct({ productId }: { productId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      formData.append('id', productId);
      const response = await axios.post<CreateProductResponse>(
        '/api/product/edit',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTS, productId],
      });
    },
  });
}
