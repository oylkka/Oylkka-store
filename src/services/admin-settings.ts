import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export function useAdminSettings() {
  return useQuery<{ settings: Record<string, string> }>({
    queryKey: [QUERY_KEYS.ADMIN_SETTINGS],
    queryFn: async () => {
      const r = await apiClient.get<{ settings: Record<string, string> }>(
        '/api/admin/settings/list',
      );
      return r.data;
    },
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { settings: Record<string, string> }) => {
      const r = await apiClient.post<{ message: string }>(
        '/api/admin/settings/update',
        data,
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_SETTINGS] });
      toast.success('Settings updated');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to update settings';
      toast.error(`Error: ${message}`);
    },
  });
}
