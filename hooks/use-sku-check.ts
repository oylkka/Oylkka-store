import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface SkuCheckResponse {
  available: boolean;
  message?: string;
}

export function useSkuCheck() {
  const {
    mutate: checkSku,
    isPending: isChecking,
    data,
    error,
  } = useMutation<SkuCheckResponse, AxiosError, string>({
    mutationFn: async (sku: string) => {
      const trimmedSku = sku.trim();
      if (!trimmedSku) {
        // Return null for empty SKU to reset the state
        return { available: false, message: '' };
      }

      const response = await axios.post<SkuCheckResponse>(
        '/api/dashboard/vendor/add-product/sku',
        { sku: trimmedSku }
      );
      return response.data;
    },
    onError: (err) => {
      console.error('SKU check error:', err);
    },
  });

  const debouncedCheckSkuAvailability = useDebouncedCallback(
    (sku: string) => checkSku(sku),
    500
  );

  const checkSkuAvailability = useCallback(
    (sku: string) => {
      debouncedCheckSkuAvailability(sku);
    },
    [debouncedCheckSkuAvailability]
  );

  return {
    isChecking,
    isAvailable: data?.available ?? null,
    error: error
      ? (error.response?.data as { message?: string })?.message || error.message
      : null,
    checkSkuAvailability,
  };
}
