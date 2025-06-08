import { QEUERY_KEYS } from '@/lib/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export class SkuService {
  private static cleanText(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  /**
   * Generate SKU: CAT-NAME-SEQ
   */
  static generateSku(
    category: string,
    productName: string,
    sequenceNumber?: number
  ): string {
    const catCode = this.cleanText(category).substring(0, 3) || 'CAT';
    const nameCode = this.cleanText(productName).substring(0, 3) || 'PRO';
    const seq = sequenceNumber ?? Math.floor(Date.now() % 100000);
    const seqStr = `-${String(seq).padStart(4, '0')}`;
    return `${catCode}-${nameCode}${seqStr}`;
  }

  /**
   * Suggest SKU with random sequence
   */
  static suggestSku(category: string, productName: string): string {
    if (!category || !productName) {
      throw new Error(
        'Category and Product Name are required for SKU generation'
      );
    }
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return this.generateSku(category, productName, randomNum);
  }

  /**
   * Validate SKU: CAT-NAME-SEQ
   */
  static isValidSku(sku: string): boolean {
    const skuRegex = /^[A-Z0-9]{3}-[A-Z0-9]{3}-\d{4,6}$/;
    return skuRegex.test(sku);
  }

  /**
   * Clean a SKU string
   */
  static sanitizeSku(sku: string): string {
    return sku
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\-]/g, '');
  }
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(
        '/api/dashboard/vendor/add-product',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data;
    },
  });
}

export function useAdminProductCategories() {
  return useQuery({
    queryKey: [QEUERY_KEYS.ADMIN_PRODUCT_CATEGORIES],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/admin/product-category`);
      return response.data;
    },
  });
}

import { useDebounce } from 'use-debounce';

// Updated useProductList hook with filter support
export interface ProductFilters {
  currentPage?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
}

export function useProductList({
  currentPage = 1,
  search = '',
  category = '',
  sortBy = '',
  minPrice,
  maxPrice,
  sizes = [],
  colors = [],
}: ProductFilters) {
  // Debounce the search query for the API call
  const [debouncedSearch] = useDebounce(search, 400);

  return useQuery({
    queryKey: [
      QEUERY_KEYS.PRODUCT_LIST,
      currentPage,
      debouncedSearch,
      category,
      sortBy,
      minPrice,
      maxPrice,
      sizes,
      colors,
    ],
    queryFn: async () => {
      const params: Record<string, any> = { currentPage };

      // Only add search param if it's not empty
      if (debouncedSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      // Add category filter
      if (category && category !== 'All') {
        params.category = category;
      }

      // Add sort parameter
      if (sortBy) {
        params.sortBy = sortBy;
      }

      // Add price range filters
      if (minPrice !== undefined && minPrice > 0) {
        params.minPrice = minPrice;
      }

      if (maxPrice !== undefined && maxPrice > 0) {
        params.maxPrice = maxPrice;
      }

      // Add size filters
      if (sizes.length > 0) {
        params.sizes = sizes.join(',');
      }

      // Add color filters
      if (colors.length > 0) {
        params.colors = colors.join(',');
      }

      const response = await axios.get('/api/public/product-list', {
        params,
      });

      return response.data;
    },
  });
}
export function useSingleProduct({ slug }: { slug: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.SINGLE_PRODUCT, slug],
    queryFn: async () => {
      const response = await axios.get(`/api/public/single-product`, {
        params: { slug: slug },
      });
      return response.data;
    },
  });
}

export function useDeleteProduct({ id }: { id: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/dashboard/admin/product?id=${id}`);
      return res.data;
    },
    onSuccess: (data, reviewId) => {
      // Invalidate product reviews queries to refetch data
      queryClient.invalidateQueries({
        queryKey: [
          QEUERY_KEYS.PRODUCT_LIST,
          QEUERY_KEYS.FEATURED_PRODUCTS,
          QEUERY_KEYS.SINGLE_PRODUCT,
          QEUERY_KEYS.USER_CART,
          QEUERY_KEYS.USER_WISHLIST,
        ],
      });
    },
  });
}

export function useRelatedProduct({ slug }: { slug: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.RELATED_PRODUCT, slug],
    queryFn: async () => {
      const response = await axios.get(`/api/public/related-products`, {
        params: { slug: slug },
      });
      return response.data;
    },
  });
}
export function useCreateReview() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(
        '/api/public/single-product/review',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data;
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await axios.delete(
        `/api/public/single-product/review?reviewId=${reviewId}`
      );
      return res.data;
    },
    onSuccess: (data, reviewId) => {
      // Invalidate product reviews queries to refetch data
      queryClient.invalidateQueries({
        queryKey: [QEUERY_KEYS.PRODUCT_REVIEWS],
      });
    },
  });
}

export function useProductReview({
  productId,
  userId,
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: {
  productId: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: [
      QEUERY_KEYS.PRODUCT_REVIEWS,
      productId,
      userId,
      page,
      limit,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (userId) {
        params.append('userId', userId);
      }

      const response = await axios.get(
        `/api/public/single-product/review?${params.toString()}`
      );
      return response.data;
    },
  });
}
