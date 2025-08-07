import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface PresenceUser {
  id: string;
  name?: string;
  username?: string;
  image?: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: number; // timestamp
  clientId: string;
  connectionId: string;
  // biome-ignore lint: error
  data?: any; // additional presence data
}

interface PresenceState {
  // State
  onlineUsers: Map<string, PresenceUser>;
  currentUserStatus: 'online' | 'away' | 'busy';
  isConnected: boolean;
  connectionError: string | null;

  // Ably instances
  // biome-ignore lint: error
  ably: any;
  // biome-ignore lint: error
  presenceChannel: any;

  // Computed getters
  getOnlineUsers: () => PresenceUser[];
  getOnlineUserCount: () => number;
  getUserById: (id: string) => PresenceUser | undefined;
  getUsersByStatus: (status: string) => PresenceUser[];

  // Actions
  // biome-ignore lint: error
  setConnection: (ably: any, channel: any) => void;
  setConnectionState: (connected: boolean, error?: string) => void;
  setCurrentUserStatus: (status: 'online' | 'away' | 'busy') => void;

  // Ably presence handlers
  // biome-ignore lint: error
  handlePresenceEnter: (member: any) => void;
  // biome-ignore lint: error
  handlePresenceLeave: (member: any) => void;
  // biome-ignore lint: error
  handlePresenceUpdate: (member: any) => void;
  // biome-ignore lint: error
  syncPresenceMembers: (members: any[]) => void;

  // Presence methods
  // biome-ignore lint: error
  initializePresence: (session: any) => Promise<void>;
  updateStatus: (status: 'online' | 'away' | 'busy') => Promise<void>;
  // biome-ignore lint: error
  enterPresence: (userData: any) => Promise<void>;
  leavePresence: () => Promise<void>;
  cleanup: () => Promise<void>;
}

export const usePresenceStore = create<PresenceState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    onlineUsers: new Map(),
    currentUserStatus: 'online',
    isConnected: false,
    connectionError: null,
    ably: null,
    presenceChannel: null,

    // Computed getters
    getOnlineUsers: () => Array.from(get().onlineUsers.values()),
    getOnlineUserCount: () => get().onlineUsers.size,
    getUserById: (id: string) => get().onlineUsers.get(id),
    getUsersByStatus: (status: string) =>
      Array.from(get().onlineUsers.values()).filter(
        (user) => user.status === status,
      ),

    // Actions
    setConnection: (ably, channel) => set({ ably, presenceChannel: channel }),

    setConnectionState: (connected, error) =>
      set({
        isConnected: connected,
        connectionError: error || null,
      }),

    setCurrentUserStatus: (status) => set({ currentUserStatus: status }),

    // Ably presence event handlers
    handlePresenceEnter: (member) => {
      const userData = member.data;
      const user: PresenceUser = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        image: userData.image,
        status: userData.status || 'online',
        lastSeen: userData.timestamp || Date.now(),
        clientId: member.clientId,
        connectionId: member.connectionId,
        data: userData,
      };

      set((state) => {
        const newUsers = new Map(state.onlineUsers);
        newUsers.set(user.id, user);
        return { onlineUsers: newUsers };
      });
    },

    handlePresenceLeave: (member) => {
      const userId = member.data?.id || member.clientId;

      set((state) => {
        const newUsers = new Map(state.onlineUsers);
        newUsers.delete(userId);
        return { onlineUsers: newUsers };
      });
    },

    handlePresenceUpdate: (member) => {
      const userData = member.data;
      const userId = userData.id;

      set((state) => {
        const newUsers = new Map(state.onlineUsers);
        const existingUser = newUsers.get(userId);

        if (existingUser) {
          newUsers.set(userId, {
            ...existingUser,
            status: userData.status || existingUser.status,
            lastSeen: userData.timestamp || Date.now(),
            data: userData,
          });
        }

        return { onlineUsers: newUsers };
      });
    },

    syncPresenceMembers: (members) => {
      const newUsers = new Map<string, PresenceUser>();

      members.forEach((member) => {
        const userData = member.data;
        const user: PresenceUser = {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          image: userData.image,
          status: userData.status || 'online',
          lastSeen: userData.timestamp || Date.now(),
          clientId: member.clientId,
          connectionId: member.connectionId,
          data: userData,
        };
        newUsers.set(user.id, user);
      });

      set({ onlineUsers: newUsers });
    },

    // Initialize presence connection
    initializePresence: async (session) => {
      if (!session?.user?.id) {
        return;
      }

      const currentState = get();

      // Cleanup existing connection
      if (currentState.ably) {
        await get().cleanup();
      }

      try {
        set({ connectionError: null });

        const { Realtime } = await import('ably');

        // Get auth token from your existing endpoint
        const authResponse = await fetch('/api/chat/presence/ably-auth');
        if (!authResponse.ok) {
          throw new Error(`Auth failed: ${authResponse.status}`);
        }

        // Create Ably instance with enhanced presence capabilities
        const ably = new Realtime({
          authUrl: '/api/chat/presence/ably-auth',
          autoConnect: true,
          clientId: session.user.id,
          // Enhanced connection options for better presence handling
          disconnectedRetryTimeout: 15000,
          suspendedRetryTimeout: 30000,
          closeOnUnload: true,
        });

        set({ ably });

        // Connection state management
        ably.connection.on('connected', async () => {
          const channel = ably.channels.get('presence:global', {
            params: { rewind: '1' }, // Get recent presence history
          });

          set({ presenceChannel: channel });

          // Set up presence event listeners BEFORE entering
          const state = get();
          channel.presence.subscribe('enter', state.handlePresenceEnter);
          channel.presence.subscribe('leave', state.handlePresenceLeave);
          channel.presence.subscribe('update', state.handlePresenceUpdate);

          // Enter presence with full user data
          await get().enterPresence({
            id: session.user.id,
            name: session.user.name,
            username: session.user.username,
            image: session.user.image,
            status: 'online',
            timestamp: Date.now(),
          });

          // Get current presence members and sync
          try {
            const presenceSet = await channel.presence.get();
            get().syncPresenceMembers(presenceSet);
          } catch (error) {
            // biome-ignore lint: error
            console.error('Failed to get presence members:', error);
          }

          get().setConnectionState(true);
        });

        ably.connection.on('disconnected', () => {
          get().setConnectionState(false);
        });

        ably.connection.on('suspended', () => {
          get().setConnectionState(false);
        });
        // biome-ignore lint: error
        ably.connection.on('failed', (error: any) => {
          get().setConnectionState(false, error.message);
        });

        ably.connection.on('closed', () => {
          get().setConnectionState(false);
        });
        // biome-ignore lint: error
      } catch (error: any) {
        get().setConnectionState(false, error.message);
      }
    },

    // Enter presence with user data
    enterPresence: async (userData) => {
      const { presenceChannel } = get();
      if (!presenceChannel) return;

      try {
        await presenceChannel.presence.enter(userData);
      } catch (error) {
        // biome-ignore lint: error
        console.error('Failed to enter presence:', error);
        throw error;
      }
    },

    // Update status (this is the main method for status changes)
    updateStatus: async (status) => {
      const { presenceChannel, ably } = get();
      if (!presenceChannel || !(ably?.connection?.state === 'connected')) {
        return;
      }

      try {
        // Update presence data with new status
        await presenceChannel.presence.update({
          id: ably.auth.clientId,
          status,
          timestamp: Date.now(),
        });

        get().setCurrentUserStatus(status);
      } catch (error) {
        // biome-ignore lint: error
        console.error('Failed to update status:', error);
        throw error;
      }
    },

    // Leave presence
    leavePresence: async () => {
      const { presenceChannel } = get();
      if (!presenceChannel) return;

      try {
        await presenceChannel.presence.leave();
      } catch (error) {
        // biome-ignore lint: error
        console.error('Failed to leave presence:', error);
      }
    },

    // Cleanup everything
    cleanup: async () => {
      const { ably, presenceChannel } = get();

      // Leave presence gracefully
      if (presenceChannel) {
        try {
          await presenceChannel.presence.leave();

          // Unsubscribe from events
          presenceChannel.presence.unsubscribe();
        } catch (error) {
          // biome-ignore lint: error
          console.error('Error during presence cleanup:', error);
        }
      }

      // Close Ably connection
      if (ably) {
        try {
          ably.close();
        } catch (error) {
          // biome-ignore lint: error
          console.error('Error closing Ably:', error);
        }
      }

      // Reset state
      set({
        ably: null,
        presenceChannel: null,
        isConnected: false,
        onlineUsers: new Map(),
        connectionError: null,
      });
    },
  })),
);
