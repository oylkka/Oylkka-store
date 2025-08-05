'use client';
import { Realtime } from 'ably';
import { useCallback, useEffect, useState } from 'react';

export function useNotification(userId: string | null) {
  const [ably, setAbly] = useState<Realtime | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // biome-ignore lint: error
  useEffect(() => {
    if (!userId) {
      if (ably) {
        ably.close();
        setAbly(null);
        setIsConnected(false);
      }
      return;
    }

    let realtimeInstance: Realtime | null = null;

    const connectAbly = async () => {
      try {
        const authResponse = await fetch(`/api/notifications/ably-auth`);
        if (!authResponse.ok) {
          throw new Error('Failed to authenticate with Ably');
        }

        const tokenRequest = await authResponse.json();

        realtimeInstance = new Realtime({
          authUrl: `/api/notifications/ably-auth`,
          autoConnect: true,
          clientId: tokenRequest.clientId,
        });

        realtimeInstance.connection.on('connected', () => {
          setIsConnected(true);
        });

        realtimeInstance.connection.on('disconnected', () => {
          setIsConnected(false);
        });

        setAbly(realtimeInstance);
      } catch (error) {
        // biome-ignore lint: error
        console.error('Error connecting to Ably:', error);
      }
    };

    connectAbly();

    return () => {
      if (realtimeInstance) {
        realtimeInstance.close();
        setIsConnected(false);
      }
    };
  }, [userId]);

  const getChannel = useCallback(
    (channelName: string) => {
      if (!ably) {
        return null;
      }
      return ably.channels.get(channelName);
    },
    [ably],
  );

  return { isConnected, getChannel };
}
