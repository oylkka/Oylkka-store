'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import { useUserAbly } from '@/hooks/use-user-ably';

interface User {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface MessageForPreview {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface ConversationDisplay {
  id: string;
  user1Id: string;
  user2Id: string;
  user1: User;
  user2: User;
  lastMessageAt: Date;
  messages: MessageForPreview[];
}

export function useConversations() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ably, isConnected } = useUserAbly();

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/conversations', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data);
      // biome-ignore lint: error
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!ably || !isConnected || !currentUserId) {
      return;
    }

    const channel = ably.channels.get(`user:${currentUserId}`);
    // biome-ignore lint: error
    const handleNewMessage = (message: any) => {
      const newConversation = message.data;
      setConversations((prev) => {
        const existingConversation = prev.find(
          (c) => c.id === newConversation.id,
        );
        if (existingConversation) {
          return prev
            .map((c) => (c.id === newConversation.id ? newConversation : c))
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime(),
            );
        }
        return [newConversation, ...prev];
      });
    };

    channel.subscribe('new-message', handleNewMessage);

    return () => {
      channel.unsubscribe('new-message', handleNewMessage);
    };
  }, [ably, isConnected, currentUserId]);

  return { conversations, isLoading, error };
}
