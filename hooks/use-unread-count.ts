'use client';
import { type SetStateAction, useEffect, useState } from 'react';
import { useAbly } from './use-ably';

export function useUnreadCount(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { getChannel, isConnected } = useAbly('notifications');

  useEffect(() => {
    if (!isConnected || !userId) return;

    const channel = getChannel(`user:${userId}:notifications`);
    if (!channel) return;

    channel.subscribe(
      'unread-count-update',
      (message: { data: { count: SetStateAction<number> } }) => {
        setUnreadCount(message.data.count);
      },
    );

    return () => {
      channel.unsubscribe();
    };
  }, [isConnected, userId, getChannel]);

  return unreadCount;
}
