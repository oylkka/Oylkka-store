'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  markMessagesAsRead,
  sendMessage as sendMessageAction,
} from '@/actions/chat';

export function useChatMessages(
  conversationId: string,
  // biome-ignore lint: error
  session: any,
  // biome-ignore lint: error
  ably: any,
  isConnected: boolean,
  // biome-ignore lint: error
  getChannel: any,
) {
  // biome-ignore lint: error
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // biome-ignore lint: error
  const channelRef = useRef<any>(null);
  // biome-ignore lint: error
  const messageListenersRef = useRef<Set<any>>(new Set());

  // Track which messages have already been marked as read to prevent duplicate calls
  const [lastReadMessageIds, setLastReadMessageIds] = useState<string[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !session?.user?.id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch messages: ${response.status} - ${errorText}`,
        );
      }
      const data = await response.json();
      // biome-ignore lint: error
      const processedMessages = data.map((msg: any) => {
        const isOwnMessage = msg.senderId === session?.user?.id;
        return {
          ...msg,
          createdAt: new Date(msg.createdAt),
          status: isOwnMessage
            ? msg.readBy?.length > 0
              ? 'read'
              : 'delivered'
            : msg.readBy?.includes(session?.user?.id)
              ? 'read'
              : 'sent',
        };
      });

      setMessages(processedMessages);
      // biome-ignore lint: error
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, session?.user?.id]);

  // Poll messages every 30 seconds
  useEffect(() => {
    fetchMessages(); // initial fetch

    const interval = setInterval(fetchMessages, 30000); // every 30s
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Reset read tracking on conversation change
  // biome-ignore lint: error
  useEffect(() => {
    setLastReadMessageIds([]);
  }, [conversationId]);

  // Setup Ably channel and listeners
  useEffect(() => {
    if (!ably || !isConnected || !conversationId || !session?.user?.id) {
      return;
    }

    const channelName = `chat:${conversationId}`;
    const channel = getChannel(channelName);
    if (!channel) {
      return;
    }

    // Clean up previous channel
    if (channelRef.current && channelRef.current !== channel) {
      const previousListeners = new Set(messageListenersRef.current);
      previousListeners.forEach((listener) => {
        // biome-ignore lint: error
        channelRef.current!.unsubscribe('message', listener);
      });
      channelRef.current.unsubscribe('read_receipt');
      channelRef.current.unsubscribe('typing');
      messageListenersRef.current.clear();
    }

    channelRef.current = channel;
    // biome-ignore lint: error
    const messageListener = (ablyMessage: any) => {
      if (ablyMessage.name !== 'message') return;
      const receivedMessage = ablyMessage.data;

      setMessages((prevMessages) => {
        const existingMessage = prevMessages.find(
          (msg) => msg.id === receivedMessage.id,
        );

        if (existingMessage) {
          return prevMessages.map((msg) =>
            msg.id === receivedMessage.id
              ? {
                  ...receivedMessage,
                  createdAt: new Date(receivedMessage.createdAt),
                  status: 'delivered' as const,
                }
              : msg,
          );
        }

        if (receivedMessage.senderId === session.user?.id) {
          const tempMessageIndex = prevMessages.findIndex(
            (msg) =>
              msg.id.startsWith('temp-') &&
              msg.content === receivedMessage.content &&
              msg.senderId === receivedMessage.senderId,
          );
          if (tempMessageIndex !== -1) {
            return prevMessages.map((msg, index) =>
              index === tempMessageIndex
                ? {
                    ...receivedMessage,
                    createdAt: new Date(receivedMessage.createdAt),
                    status: 'delivered' as const,
                  }
                : msg,
            );
          }
        }

        return [
          ...prevMessages,
          {
            ...receivedMessage,
            createdAt: new Date(receivedMessage.createdAt),
            status: 'delivered' as const,
          },
        ];
      });
    };

    // biome-ignore lint: error
    const typingListener = (ablyMessage: any) => {
      const { userId, isTyping: typing } = ablyMessage.data;
      if (userId !== session.user?.id) {
        setIsTyping(typing);
      }
    };
    // biome-ignore lint: error
    const readReceiptListener = (ablyMessage: any) => {
      const {
        readerId,
        messageIds,
        conversationId: rcConvId,
      } = ablyMessage.data;
      if (rcConvId === conversationId && readerId !== session.user?.id) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (
              messageIds.includes(msg.id) &&
              // biome-ignore lint: error
              msg.senderId === session!.user!.id
            ) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), readerId],
                status: 'read',
              };
            }
            return msg;
          }),
        );
      }
    };

    channel.subscribe('message', messageListener);
    channel.subscribe('read_receipt', readReceiptListener);
    channel.subscribe('typing', typingListener);

    messageListenersRef.current.add(messageListener);

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe('message', messageListener);
        channelRef.current.unsubscribe('read_receipt', readReceiptListener);
        channelRef.current.unsubscribe('typing', typingListener);
      }
      messageListenersRef.current.delete(messageListener);
    };
  }, [
    ably,
    isConnected,
    conversationId,
    session?.user?.id,
    getChannel,
    session,
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !session?.user?.id || !conversationId) {
        return;
      }

      if (channelRef.current && isConnected) {
        channelRef.current.publish('typing', {
          userId: session.user.id,
          isTyping: false,
        });
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempMessage = {
        id: tempId,
        conversationId,
        senderId: session.user.id,
        content,
        createdAt: new Date(),
        sender: {
          id: session.user.id,
          name: session.user.name,
          username: session.user.username,
          image: session.user.image,
        },
        status: 'sending',
      };

      setMessages((prev) => [...prev, tempMessage]);

      try {
        const savedMessage = await sendMessageAction(conversationId, content);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...savedMessage,
                  createdAt: new Date(savedMessage.createdAt),
                  status: 'sent' as const,
                }
              : msg,
          ),
        );

        if (channelRef.current && isConnected) {
          await channelRef.current.publish('message', {
            ...savedMessage,
            createdAt: savedMessage.createdAt,
          });
        }
      } catch {
        toast.error('Failed to send message');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: 'failed' as const } : msg,
          ),
        );
      }
    },
    [conversationId, session, isConnected],
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message || message.status !== 'failed') return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'sending' } : msg,
        ),
      );

      try {
        const savedMessage = await sendMessageAction(
          conversationId,
          message.content,
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...savedMessage,
                  createdAt: new Date(savedMessage.createdAt),
                  status: 'sent' as const,
                }
              : msg,
          ),
        );
      } catch {
        toast.error('Failed to retry message');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: 'failed' } : msg,
          ),
        );
      }
    },
    [conversationId, messages],
  );

  // Auto-mark messages as read, but only for newly unread messages (avoid repeat calls)
  useEffect(() => {
    if (!session?.user?.id || !channelRef.current) return;

    const unreadMessages = messages
      .filter(
        (msg) =>
          msg.senderId !== session.user.id &&
          !msg.readBy?.includes(session.user.id),
      )
      .map((msg) => msg.id);

    const newUnreadMessages = unreadMessages.filter(
      (id) => !lastReadMessageIds.includes(id),
    );

    if (newUnreadMessages.length > 0) {
      markMessagesAsRead(conversationId, newUnreadMessages)
        .then(() => {
          setLastReadMessageIds((prev) => [...prev, ...newUnreadMessages]);
          if (isConnected && channelRef.current) {
            channelRef.current.publish('read_receipt', {
              conversationId,
              readerId: session.user.id,
              messageIds: newUnreadMessages,
            });
          }
        })
        // biome-ignore lint: error
        .catch((err) => console.error('Error marking messages as read:', err));
    }
  }, [
    messages,
    conversationId,
    session?.user?.id,
    isConnected,
    lastReadMessageIds,
  ]);

  return {
    messages,
    isTyping,
    sendMessage,
    retryMessage,
    isLoading,
    error,
  };
}
