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

export function useProductList({ currentPage = 1 }: { currentPage?: number }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.PRODUCT_LIST, currentPage],
    queryFn: async () => {
      const response = await axios.get('/api/public/product-list', {
        params: { currentPage },
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
