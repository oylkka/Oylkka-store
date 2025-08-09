'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePresenceStore } from '@/store/presenceStore';

export function useUnreadMessageCount() {
  const { data: session, status } = useSession();
  const { ably, isConnected } = usePresenceStore();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // biome-ignore lint: error
  const channelRef = useRef<any>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setIsLoading(false);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/chat/unread-count');
      if (!response.ok) {
        throw new Error('Failed to fetch unread message count');
      }
      const data = await response.json();
      setUnreadCount(data.unreadCount);
      // biome-ignore lint: error
    } catch (err: any) {
      setError(err.message);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!ably || !isConnected || !session?.user?.id) {
      return;
    }

    const channelName = `private:unread_count:${session.user.id}`;
    const channel = ably.channels.get(channelName);
    if (!channel) {
      return;
    }

    // Clean up previous channel
    if (channelRef.current && channelRef.current !== channel) {
      channelRef.current.unsubscribe('unread_update');
    }

    channelRef.current = channel;

    const unreadUpdateListener = () => {
      fetchUnreadCount();
    };

    channel.subscribe('unread_update', unreadUpdateListener);

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe('unread_update', unreadUpdateListener);
      }
    };
  }, [ably, isConnected, session?.user?.id, fetchUnreadCount]);

  return {
    unreadCount,
    isLoading,
    error,
    refetchUnreadCount: fetchUnreadCount,
  };
}
