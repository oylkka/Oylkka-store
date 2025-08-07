'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { usePresenceStore } from '@/store/presenceStore';

interface PresenceProviderProps {
  children: React.ReactNode;
}

export function PresenceProvider({ children }: PresenceProviderProps) {
  const { data: session, status } = useSession();
  const { initializePresence, updateStatus, cleanup, isConnected } =
    usePresenceStore();
  const inititalizedRef = useRef(false);

  // Initialize presence when authenticated
  //   biome-ignore lint: error
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.id &&
      !inititalizedRef.current
    ) {
      inititalizedRef.current = true;
      initializePresence(session);
    } else if (status === 'unauthenticated') {
      inititalizedRef.current = false;
      cleanup();
    }
  }, [session?.user?.id, status, initializePresence, cleanup]);

  // Handle page visibility (only if connected)
  useEffect(() => {
    if (!isConnected) return;

    const handleVisibilityChange = () => {
      const newStatus =
        document.visibilityState === 'visible' ? 'online' : 'away';
      // biome-ignore lint: error
      updateStatus(newStatus).catch(console.error);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, updateStatus]);

  // Cleanup on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Note: This might not always work due to browser limitations
      // Ably's closeOnUnload option handles this better
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cleanup]);

  return <>{children}</>;
}
