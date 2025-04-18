'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export const useFilterParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`?${params.toString()}`);
  };

  const clearParams = (keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((key) => params.delete(key));
    router.push(`?${params.toString()}`);
  };

  const getParam = (key: string) => {
    return searchParams.get(key) || '';
  };

  return {
    params: searchParams,
    getParam,
    updateParams,
    clearParams,
  };
};
