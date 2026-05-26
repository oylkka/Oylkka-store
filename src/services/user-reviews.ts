import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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
    queryKey: [QUERY_KEYS.MY_REVIEWS, page],
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

  return useMutation<
    void,
    Error,
    { id: string; rating?: number; title?: string; content?: string }
  >({
    mutationFn: async ({ id, ...data }) => {
      const r = await apiClient.put(`/api/reviews/my/${id}`, data);
      return r.data;
    },
    onMutate: () => {
      toast.loading('Updating review...', { id: 'update-review' });
    },
    onSuccess: () => {
      toast.success('Review updated', { id: 'update-review' });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS, 'my-reviews'],
      });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to update review';
      toast.error(message, { id: 'update-review' });
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/api/reviews/my/${id}`);
    },
    onMutate: () => {
      toast.loading('Deleting review...', { id: 'delete-review' });
    },
    onSuccess: () => {
      toast.success('Review deleted', { id: 'delete-review' });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MY_REVIEWS],
      });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to delete review';
      toast.error(message, { id: 'delete-review' });
    },
  });
}
