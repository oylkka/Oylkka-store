'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';

interface UsernameCheckResult {
  available: boolean;
  suggestion?: string;
  error?: string;
}

export function useUsernameCheck(initialUsername: string = '') {
  const [username, setUsername] = useState(initialUsername);
  const [debouncedUsername] = useDebounce(username, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ['username', debouncedUsername],
    queryFn: async (): Promise<UsernameCheckResult> => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        return { available: false };
      }

      const response = await fetch(
        `/api/auth/onboarding/username?username=${encodeURIComponent(debouncedUsername)}`
      );

      if (!response.ok) {
        throw new Error('Failed to check username');
      }

      return response.json();
    },
    enabled: debouncedUsername.length >= 3,
  });

  return {
    username,
    setUsername,
    isAvailable: data?.available,
    suggestion: data?.suggestion,
    isLoading,
    error,
  };
}
