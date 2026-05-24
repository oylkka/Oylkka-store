import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  CategoryFormType,
  EditCategoryFormType,
} from '@/schemas/category-schema';

type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  description: string | null;
  parentId: string | null;
  order: number;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count: { products: number; children: number };
};

type CategoryResponse = {
  message: string;
  category: AdminCategory;
};

export function useCategories() {
  return useQuery<AdminCategory[]>({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: async () => {
      const response = await apiClient.get<AdminCategory[]>(
        '/api/categories/list',
      );
      return response.data;
    },
  });
}

export function usePublicCategories() {
  return useQuery<PublicCategory[]>({
    queryKey: [QUERY_KEYS.CATEGORIES, 'public'],
    queryFn: async () => {
      const response = await apiClient.get<PublicCategory[]>(
        '/api/categories/public-list',
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(id: string | undefined) {
  return useQuery<AdminCategory>({
    queryKey: ['category', id],
    queryFn: async () => {
      const response = await apiClient.post<AdminCategory>(
        '/api/categories/get-single',
        { id },
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CategoryFormType) => {
      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('description', values.description ?? '');
      formData.append('parentId', values.parentId ?? '');
      formData.append('featured', String(values.featured));
      formData.append('order', String(values.order));

      if (values.image instanceof FileList && values.image.length > 0) {
        formData.append('image', values.image[0]);
      }

      const response = await apiClient.post<CategoryResponse>(
        '/api/categories/add',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return response.data;
    },
    onMutate: () => {
      toast.loading('Creating category...', { id: 'category-create' });
    },
    onSuccess: () => {
      toast.success('Category created successfully!', {
        id: 'category-create',
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to create category';
      toast.error(`Error: ${message}`, { id: 'category-create' });
    },
  });
}

export function useEditCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: EditCategoryFormType & { id: string }) => {
      const formData = new FormData();

      formData.append('id', values.id);
      formData.append('name', values.name);
      formData.append('description', values.description ?? '');
      formData.append('parentId', values.parentId ?? '');
      formData.append('featured', String(values.featured));
      formData.append('order', String(values.order));

      if (values.image instanceof FileList && values.image.length > 0) {
        formData.append('image', values.image[0]);
      }

      formData.append(
        'keepExistingImage',
        String(values.keepExistingImage ?? false),
      );

      const response = await apiClient.post<CategoryResponse>(
        '/api/categories/edit',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return response.data;
    },
    onMutate: () => {
      toast.loading('Updating category...', { id: 'category-edit' });
    },
    onSuccess: () => {
      toast.success('Category updated successfully!', {
        id: 'category-edit',
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to update category';
      toast.error(`Error: ${message}`, { id: 'category-edit' });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post('/api/categories/delete', { id });
      return response.data;
    },
    onMutate: () => {
      toast.loading('Deleting category...', { id: 'category-delete' });
    },
    onSuccess: () => {
      toast.success('Category deleted successfully!', {
        id: 'category-delete',
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to delete category';
      toast.error(`Error: ${message}`, { id: 'category-delete' });
    },
  });
}
