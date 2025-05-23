import { QEUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export function useAdminCategoryList() {
  return useQuery({
    queryKey: [QEUERY_KEYS.ADMIN_CATEGORY_LIST],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/admin/category');
      return response.json();
    },
  });
}

export function useSingleCategory({ slug }: { slug: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.SINGLE_CATEGORY, slug],
    queryFn: async () => {
      const response = await fetch(
        `/api/dashboard/admin/category/single-category?slug=${slug}`
      );
      return response.json();
    },
  });
}
