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

export type CategoryProduct = {
  id: string;
  productName: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  hasVariants: boolean;
  images: { imageUrl: string }[];
  category: { id: string; name: string; slug: string };
  shop: { id: string; name: string; slug: string } | null;
  _count: { reviews: number };
  createdAt: string;
};

export type ProductListResponse = {
  products: CategoryProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PublicProduct = {
  id: string;
  productName: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  stock: number;
  hasVariants: boolean;
  sku: string;
  brand: string | null;
  condition: string;
  conditionDescription: string | null;
  weight: number | null;
  weightUnit: string;
  freeShipping: boolean;
  dimensionLength: number | null;
  dimensionWidth: number | null;
  dimensionHeight: number | null;
  dimensionUnit: string;
  tags: string[];
  images: {
    id: string;
    imageUrl: string;
    altText: string | null;
    order: number;
  }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    discountPrice: number | null;
    stock: number;
    attributes: Record<string, string>;
    imageUrl: string | null;
  }[];
  attributeOptions: { id: string; name: string; values: string[] }[];
  category: { id: string; name: string; slug: string };
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    rating: number;
    totalReviews: number;
    totalSales: number;
    createdAt: string;
  } | null;
  _count: { reviews: number };
  ratingBreakdown: Record<number, number>;
  createdAt: string;
};

export type ProductSortOption = 'newest' | 'price_asc' | 'price_desc';

export function useCategoryProducts(slug: string | undefined) {
  return useQuery<CategoryProduct[]>({
    queryKey: [QUERY_KEYS.PUBLIC_PRODUCTS, 'category', slug],
    queryFn: async () => {
      const response = await axios.get<CategoryProduct[]>(
        '/api/product/public-by-category',
        { params: { slug } },
      );
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useAllProducts(params: {
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
  category?: string;
}) {
  return useQuery<ProductListResponse>({
    queryKey: [QUERY_KEYS.PUBLIC_PRODUCTS, 'list', params],
    queryFn: async () => {
      const response = await axios.get<ProductListResponse>(
        '/api/product/public-list',
        { params },
      );
      return response.data;
    },
  });
}

export function usePublicCategories() {
  return useQuery<{ id: string; name: string; slug: string }[]>({
    queryKey: [QUERY_KEYS.CATEGORIES, 'public'],
    queryFn: async () => {
      const response = await axios.get('/api/categories/public-list');
      return response.data;
    },
  });
}

export type PublicReview = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  verified: boolean;
  helpfulCount: number;
  vendorReply: string | null;
  vendorRepliedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
  images: { id: string; imageUrl: string; order: number }[];
};

export type ProductReviewsResponse = {
  reviews: PublicReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  ratingBreakdown: Record<number, number>;
};

export function usePublicProductReviews(productId: string, page: number = 1) {
  return useQuery<ProductReviewsResponse>({
    queryKey: [QUERY_KEYS.PUBLIC_PRODUCTS, 'reviews', productId, page],
    queryFn: async () => {
      const response = await axios.get<ProductReviewsResponse>(
        '/api/product/public-reviews',
        { params: { productId, page, limit: 10 } },
      );
      return response.data;
    },
    enabled: !!productId,
  });
}

export function usePublicProduct(slug: string) {
  return useQuery<PublicProduct>({
    queryKey: [QUERY_KEYS.PUBLIC_PRODUCTS, 'single', slug],
    queryFn: async () => {
      const response = await axios.get<PublicProduct>(
        '/api/product/public-single',
        { params: { slug } },
      );
      return response.data;
    },
    enabled: !!slug,
  });
}

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
