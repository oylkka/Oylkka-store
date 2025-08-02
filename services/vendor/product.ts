import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import { QUERY_KEYS } from '@/lib/constants';

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

export function useVendorProducts({
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
      QUERY_KEYS.VENDOR_PRODUCTS,
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
      // biome-ignore lint: error
      const params: Record<string, any> = { currentPage };

      // Only add search param if it's not empty
      if (debouncedSearch?.trim()) {
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

      const response = await axios.get('/api/dashboard/vendor/product-list', {
        params,
      });

      return response.data;
    },
  });
}
