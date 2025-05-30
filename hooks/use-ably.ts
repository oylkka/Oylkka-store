'use client';
import { useCallback, useEffect, useState } from 'react';

export function useAbly(conversationId: string | null) {
  const [ably, setAbly] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<string>('initialized');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]); // New state for online users

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

    let realtimeInstance: any = null;
    let connectionTimeout: NodeJS.Timeout;

    const connectAbly = async () => {
      try {
        console.log('Starting Ably connection...');
        setConnectionError(null);
        setConnectionState('connecting');

        const { Realtime } = await import('ably');

        // Test the auth endpoint
        console.log('Testing auth endpoint...');
        const authResponse = await fetch(
          `/api/chat/ably/ably-auth?conversationId=${conversationId}`
        );

        if (!authResponse.ok) {
          const errorText = await authResponse.text();
          throw new Error(
            `Auth endpoint failed: ${authResponse.status} - ${errorText}`
          );
        }

        const tokenRequest = await authResponse.json();
        console.log('Auth token received:', tokenRequest);

        realtimeInstance = new Realtime({
          authUrl: `/api/chat/ably/ably-auth?conversationId=${conversationId}`,
          autoConnect: true,
          clientId: tokenRequest.clientId, // Ensure clientId is included
        });

        // Set a connection timeout
        connectionTimeout = setTimeout(() => {
          console.error('Ably connection timeout after 15 seconds');
          setConnectionError(
            'Connection timeout - please check your network and try again'
          );
          setConnectionState('failed');
        }, 15000);

        // Connection state listeners
        realtimeInstance.connection.on('connected', () => {
          console.log('✅ Ably connection state: connected');
          clearTimeout(connectionTimeout);
          setIsConnected(true);
          setConnectionState('connected');
          setConnectionError(null);
        });

        realtimeInstance.connection.on('connecting', () => {
          console.log('🔄 Ably connection state: connecting');
          setIsConnected(false);
          setConnectionState('connecting');
        });

        realtimeInstance.connection.on('disconnected', () => {
          console.log('❌ Ably connection state: disconnected');
          setIsConnected(false);
          setConnectionState('disconnected');
          setOnlineUsers([]); // Clear online users
        });

        realtimeInstance.connection.on('failed', (error: any) => {
          console.error('💥 Ably connection state: failed', error);
          clearTimeout(connectionTimeout);
          setIsConnected(false);
          setConnectionState('failed');
          setConnectionError(
            `Connection failed: ${error.message || 'Unknown error'}`
          );
          setOnlineUsers([]); // Clear online users
        });

        realtimeInstance.connection.on('suspended', () => {
          console.log('⏸️ Ably connection state: suspended');
          setIsConnected(false);
          setConnectionState('suspended');
          setOnlineUsers([]); // Clear online users
        });

        realtimeInstance.connection.on('error', (error: any) => {
          console.error('🚨 Ably connection error:', error);
          setConnectionError(
            `Connection error: ${error.message || 'Unknown error'}`
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
        channel.presence.subscribe('enter', (member: any) => {
          setOnlineUsers((prev) => {
            const updated = [...prev, member.clientId].filter(
              (id, index, self) => self.indexOf(id) === index
            );
            console.log(
              'User entered:',
              member.clientId,
              'Online users:',
              updated
            );
            return updated;
          });
        });

        channel.presence.subscribe('leave', (member: any) => {
          setOnlineUsers((prev) => {
            const updated = prev.filter((id) => id !== member.clientId);
            console.log(
              'User left:',
              member.clientId,
              'Online users:',
              updated
            );
            return updated;
          });
        });

        channel.presence.subscribe('update', (member: any) => {
          console.log('Presence update for:', member.clientId);
        });

        // Enter presence
        channel.presence.enter();

        // Get current presence members
        channel.presence.get((err: any, members: any[]) => {
          if (err) {
            console.error('Error fetching presence:', err);
            return;
          }
          const userIds = members.map((m) => m.clientId);
          setOnlineUsers(userIds);
          console.log('Initial online users:', userIds);
        });
      } catch (error: any) {
        console.error('❌ Ably setup error:', error);
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
        console.log('🔌 Closing Ably connection...');
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
        console.warn('Ably instance not available for channel:', channelName);
        return null;
      }
      return ably.channels.get(channelName);
    },
    [ably]
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
