'use client';

import {
  markMessagesAsRead,
  sendMessage as sendMessageAction,
} from '@/actions/chat';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useChatMessages(
  conversationId: string,
  session: any,
  ably: any,
  isConnected: boolean,
  getChannel: any
) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<any>(null);
  const messageListenersRef = useRef<Set<any>>(new Set());

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !session?.user?.id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch messages: ${response.status} - ${errorText}`
        );
      }
      const data = await response.json();
      const processedMessages = data.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
        status: 'read' as const,
      }));
      setMessages(processedMessages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, session?.user?.id]);

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
        channelRef.current!.unsubscribe('message', listener);
      });
      channelRef.current.unsubscribe('read_receipt');
      channelRef.current.unsubscribe('typing');
      messageListenersRef.current.clear();
    }

    channelRef.current = channel;

    const messageListener = (ablyMessage: any) => {
      if (ablyMessage.name !== 'message') return;

      const receivedMessage = ablyMessage.data;

      setMessages((prevMessages) => {
        const existingMessage = prevMessages.find(
          (msg) => msg.id === receivedMessage.id
        );

        if (existingMessage) {
          return prevMessages.map((msg) =>
            msg.id === receivedMessage.id
              ? {
                  ...receivedMessage,
                  createdAt: new Date(receivedMessage.createdAt),
                  status: 'delivered' as const,
                }
              : msg
          );
        }

        if (receivedMessage.senderId === session.user?.id) {
          const tempMessageIndex = prevMessages.findIndex(
            (msg) =>
              msg.id.startsWith('temp-') &&
              msg.content === receivedMessage.content &&
              msg.senderId === receivedMessage.senderId
          );

          if (tempMessageIndex !== -1) {
            return prevMessages.map((msg, index) =>
              index === tempMessageIndex
                ? {
                    ...receivedMessage,
                    createdAt: new Date(receivedMessage.createdAt),
                    status: 'delivered' as const,
                  }
                : msg
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

    const typingListener = (ablyMessage: any) => {
      console.log('👥 Typing event received:', ablyMessage.data);
      const { userId, isTyping: typing } = ablyMessage.data;
      if (userId !== session.user?.id) {
        console.log('⌨️ Setting typing state for other user:', typing);
        setIsTyping(typing);
        if (typing) {
          setTimeout(() => {
            console.log('⏰ Typing timeout reached, setting to false');
            setIsTyping(false);
          }, 3000);
        }
      } else {
        console.log('🚫 Ignoring typing event from current user');
      }
    };

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
              msg.senderId === session!.user!.id
            ) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), readerId],
                status: 'read',
              };
            }
            return msg;
          })
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

      // Stop typing indicator
      if (channelRef.current && isConnected) {
        channelRef.current.publish('typing', {
          userId: session.user.id,
          isTyping: false,
        });
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempMessage = {
        id: tempId,
        conversationId: conversationId,
        senderId: session.user.id,
        content: content,
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
              : msg
          )
        );

        if (channelRef.current && isConnected) {
          await channelRef.current.publish('message', {
            ...savedMessage,
            createdAt: savedMessage.createdAt,
          });
        }
      } catch (err: any) {
        console.error('Error sending message:', err);
        toast.error('Failed to send message');

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: 'failed' as const } : msg
          )
        );
      }
    },
    [conversationId, session, isConnected]
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message || message.status !== 'failed') {
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'sending' } : msg
        )
      );

      try {
        const savedMessage = await sendMessageAction(
          conversationId,
          message.content
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...savedMessage,
                  createdAt: new Date(savedMessage.createdAt),
                  status: 'sent' as const,
                }
              : msg
          )
        );
      } catch (err: any) {
        console.error('Error retrying message:', err);
        toast.error('Failed to retry message');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: 'failed' } : msg
          )
        );
      }
    },
    [conversationId, messages]
  );

  // Auto-mark messages as read
  useEffect(() => {
    const unreadMessages = messages
      .filter(
        (msg) => msg.senderId !== session?.user?.id && msg.status !== 'read'
      )
      .map((msg) => msg.id);

    if (unreadMessages.length > 0 && session?.user?.id) {
      markMessagesAsRead(conversationId, unreadMessages).catch((e) =>
        console.error('Failed to mark messages as read:', e)
      );
    }
  }, [messages, conversationId, session?.user?.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isTyping,
    sendMessage,
    retryMessage,
    isLoading,
    error,
  };
}
