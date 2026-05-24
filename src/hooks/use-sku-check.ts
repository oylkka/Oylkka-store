import { useCallback, useEffect, useRef, useState } from 'react';

interface SkuCheckResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
  checkSkuAvailability: (sku: string) => void;
}

export function useSkuCheck(options?: { productId?: string }): SkuCheckResult {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSkuRef = useRef<string>('');
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkSkuAvailability = useCallback(
    (sku: string) => {
      if (!sku || sku.length < 3) {
        setIsAvailable(null);
        setError(null);
        return;
      }

      if (sku === lastSkuRef.current) return;
      lastSkuRef.current = sku;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsChecking(true);
      setError(null);

      timeoutRef.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ sku });
          if (options?.productId) {
            params.set('productId', options.productId);
          }
          const res = await fetch(`/api/product/check-sku?${params}`);
          const data = await res.json();
          if (mountedRef.current) {
            setIsAvailable(data.available ?? true);
          }
        } catch {
          if (mountedRef.current) {
            setError('Failed to check SKU availability');
            setIsAvailable(null);
          }
        } finally {
          if (mountedRef.current) {
            setIsChecking(false);
          }
        }
      }, 500);
    },
    [options?.productId],
  );

  return { isChecking, isAvailable, error, checkSkuAvailability };
}
