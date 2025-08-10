'use client';
import { useCallback, useEffect, useState } from 'react';

export function useUserAbly() {
  // biome-ignore lint: error
  const [ably, setAbly] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // biome-ignore lint: error
    let realtimeInstance: any = null;

    const connectAbly = async () => {
      try {
        const { Realtime } = await import('ably');
        const authResponse = await fetch('/api/chat/ably/user-auth');

        if (!authResponse.ok) {
          throw new Error('Failed to authenticate with Ably');
        }

        const tokenRequest = await authResponse.json();

        realtimeInstance = new Realtime({
          authUrl: '/api/chat/ably/user-auth',
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
      }
    };
  }, []);

  const getChannel = useCallback(
    (channelName: string) => {
      if (!ably) {
        return null;
      }
      return ably.channels.get(channelName);
    },
    [ably],
  );

  return { ably, isConnected, getChannel };
}
