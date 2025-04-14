// hooks/use-sku-check.ts
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function useSkuCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSkuAvailability = useDebouncedCallback(async (sku: string) => {
    if (!sku) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    try {
      setIsChecking(true);
      setError(null);

      const response = await fetch('/api/products/check-sku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku }),
      });

      if (!response.ok) {
        throw new Error('Failed to check SKU');
      }

      const data = await response.json();
      setIsAvailable(data.available);
      if (!data.available) {
        setError(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, 500); // Debounce to avoid too many requests

  return {
    isChecking,
    isAvailable,
    error,
    checkSkuAvailability,
  };
}
