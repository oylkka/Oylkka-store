'use client';
import { useCallback, useEffect, useState } from 'react';

export function useAbly(conversationId: string | null) {
  // biome-ignore lint: error
  const [ably, setAbly] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<string>('initialized');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]); // New state for online users
  // biome-ignore lint: error
  useEffect(() => {
    if (!conversationId) {
      if (ably) {
        ably.close();
        setAbly(null);
        setIsConnected(false);
        setConnectionState('disconnected');
        setOnlineUsers([]); // Clear online users
      }
      return;
    }
    // biome-ignore lint: error
    let realtimeInstance: any = null;
    let connectionTimeout: NodeJS.Timeout;

    const connectAbly = async () => {
      try {
        setConnectionError(null);
        setConnectionState('connecting');

        const { Realtime } = await import('ably');

        const authResponse = await fetch(
          `/api/chat/ably/ably-auth?conversationId=${conversationId}`,
        );

        if (!authResponse.ok) {
          const errorText = await authResponse.text();
          throw new Error(
            `Auth endpoint failed: ${authResponse.status} - ${errorText}`,
          );
        }

        const tokenRequest = await authResponse.json();

        realtimeInstance = new Realtime({
          authUrl: `/api/chat/ably/ably-auth?conversationId=${conversationId}`,
          autoConnect: true,
          clientId: tokenRequest.clientId, // Ensure clientId is included
        });

        // Set a connection timeout
        connectionTimeout = setTimeout(() => {
          setConnectionError(
            'Connection timeout - please check your network and try again',
          );
          setConnectionState('failed');
        }, 15000);

        // Connection state listeners
        realtimeInstance.connection.on('connected', () => {
          clearTimeout(connectionTimeout);
          setIsConnected(true);
          setConnectionState('connected');
          setConnectionError(null);
        });

        realtimeInstance.connection.on('connecting', () => {
          setIsConnected(false);
          setConnectionState('connecting');
        });

        realtimeInstance.connection.on('disconnected', () => {
          setIsConnected(false);
          setConnectionState('disconnected');
          setOnlineUsers([]); // Clear online users
        });
        // biome-ignore lint: error
        realtimeInstance.connection.on('failed', (error: any) => {
          clearTimeout(connectionTimeout);
          setIsConnected(false);
          setConnectionState('failed');
          setConnectionError(
            `Connection failed: ${error.message || 'Unknown error'}`,
          );
          setOnlineUsers([]); // Clear online users
        });

        realtimeInstance.connection.on('suspended', () => {
          setIsConnected(false);
          setConnectionState('suspended');
          setOnlineUsers([]); // Clear online users
        });
        // biome-ignore lint: error
        realtimeInstance.connection.on('error', (error: any) => {
          setConnectionError(
            `Connection error: ${error.message || 'Unknown error'}`,
          );
        });

        // Set initial state if already connected
        if (realtimeInstance.connection.state === 'connected') {
          setIsConnected(true);
          setConnectionState('connected');
          clearTimeout(connectionTimeout);
        }

        setAbly(realtimeInstance);

        // Presence setup
        const channel = realtimeInstance.channels.get(`chat:${conversationId}`);
        // biome-ignore lint: error
        channel.presence.subscribe('enter', (member: any) => {
          setOnlineUsers((prev) => {
            const updated = [...prev, member.clientId].filter(
              (id, index, self) => self.indexOf(id) === index,
            );

            return updated;
          });
        });
        // biome-ignore lint: error
        channel.presence.subscribe('leave', (member: any) => {
          setOnlineUsers((prev) => {
            const updated = prev.filter((id) => id !== member.clientId);

            return updated;
          });
        });
        // biome-ignore lint: error
        channel.presence.subscribe('update', (member: any) => {
          // biome-ignore lint: error
          console.log('Presence update for:', member.clientId);
        });

        // Enter presence
        channel.presence.enter();

        // Get current presence members
        // biome-ignore lint: error
        channel.presence.get((err: any, members: any[]) => {
          if (err) {
            return;
          }
          const userIds = members.map((m) => m.clientId);
          setOnlineUsers(userIds);
        });
        // biome-ignore lint: error
      } catch (error: any) {
        setConnectionError(`Setup error: ${error.message}`);
        setIsConnected(false);
        setConnectionState('failed');
        clearTimeout(connectionTimeout);
      }
    };

    connectAbly();

    return () => {
      clearTimeout(connectionTimeout);
      if (realtimeInstance) {
        const channel = realtimeInstance.channels.get(`chat:${conversationId}`);
        channel.presence.leave(); // Leave presence
        realtimeInstance.close();
        setIsConnected(false);
        setConnectionState('disconnected');
        setOnlineUsers([]); // Clear online users
      }
    };
  }, [conversationId]);

  const getChannel = useCallback(
    (channelName: string) => {
      if (!ably) {
        return null;
      }
      return ably.channels.get(channelName);
    },
    [ably],
  );

  return {
    ably,
    isConnected,
    getChannel,
    connectionError,
    connectionState,
    onlineUsers,
  };
}
