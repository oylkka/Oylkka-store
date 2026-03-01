import { useMutation } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface SkuCheckResponse {
  available: boolean;
  message?: string;
}

interface UseSkuCheckOptions {
  productId?: string;
}

export function useSkuCheck({ productId }: UseSkuCheckOptions = {}) {
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
        { sku: trimmedSku, productId },
      );
      return response.data;
    },
  });

  const debouncedCheckSkuAvailability = useDebouncedCallback(
    (sku: string) => checkSku(sku),
    500,
  );

  const checkSkuAvailability = useCallback(
    (sku: string) => {
      debouncedCheckSkuAvailability(sku);
    },
    [debouncedCheckSkuAvailability],
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
