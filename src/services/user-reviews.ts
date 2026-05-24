import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type MyReview = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  verified: boolean;
  helpfulCount: number;
  vendorReply: string | null;
  createdAt: string;
  product: {
    id: string;
    productName: string;
    slug: string;
    images: { imageUrl: string }[];
  };
  images: { id: string; imageUrl: string; order: number }[];
};

type MyReviewsResponse = {
  reviews: MyReview[];
  total: number;
  page: number;
  totalPages: number;
};

export function useMyReviews(page: number = 1) {
  return useQuery<MyReviewsResponse>({
    queryKey: [QUERY_KEYS.ORDERS, 'my-reviews', page],
    queryFn: async () => {
      const r = await apiClient.get<MyReviewsResponse>(
        `/api/reviews/my/list?page=${page}&limit=10`,
      );
      return r.data;
    },
  });
}

export function useUpdateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string; rating?: number; title?: string; content?: string }) => {
      const r = await apiClient.put(`/api/reviews/my/${id}`, data);
      return r.data;
    },
    onMutate: () => {
      toast.loading('Updating review...', { id: 'update-review' });
    },
    onSuccess: () => {
      toast.success('Review updated', { id: 'update-review' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS, 'my-reviews'] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(
        error.response?.data?.error || 'Failed to update review',
        { id: 'update-review' },
      );
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/reviews/my/${id}`);
    },
    onMutate: () => {
      toast.loading('Deleting review...', { id: 'delete-review' });
    },
    onSuccess: () => {
      toast.success('Review deleted', { id: 'delete-review' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS, 'my-reviews'] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(
        error.response?.data?.error || 'Failed to delete review',
        { id: 'delete-review' },
      );
    },
  });
}
