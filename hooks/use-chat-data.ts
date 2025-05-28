'use client';

import { useCallback, useEffect, useState } from 'react';

export function useChatData(conversationId: string, status: string) {
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!conversationId || status !== 'authenticated') {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/chat/conversations/${conversationId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch conversation: ${response.status} - ${errorText}`
        );
      }
      const data = await response.json();
      setConversation(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, status]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  return {
    conversation,
    isLoading,
    error,
    refetch: fetchConversation,
  };
}
