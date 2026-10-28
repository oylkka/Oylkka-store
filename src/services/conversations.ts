import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ConnectionStateChange,
  InboundMessage,
  RealtimeChannel,
  TokenRequest,
} from 'ably';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';
import {
  createRealtimeClient,
  type RealtimeClient,
} from '@/lib/realtime-client';
import type {
  ConversationContext,
  ConversationListItem,
  MessageCreatedEvent,
  MessageSummary,
  MessageView,
} from '@/types/messaging';

type ConversationListResponse = {
  conversations: ConversationListItem[];
  unreadCount: number;
};

type ConversationDetailResponse = {
  conversation: ConversationContext;
};

type MessagesResponse = {
  messages: MessageView[];
};

type CreateConversationResponse = {
  conversation: ConversationContext;
  message: MessageSummary;
};

type SendMessageResponse = {
  message: MessageSummary;
};

type MarkReadResponse = {
  success: true;
  updated: number;
};

export type CreateConversationInput = {
  shopId: string;
  subject: string;
  message: string;
  productId?: string | null;
  orderId?: string | null;
};

type MarkReadVariables = {
  conversationId: string;
  silent?: boolean;
};

export type ConversationRealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'reconnecting'
  | 'connected'
  | 'unavailable';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.message;
  }

  return fallback;
}

function getUserChannelName(userId: string): string {
  return `user:${userId}`;
}

function compareMessages(a: MessageView, b: MessageView): number {
  const createdAtOrder = a.createdAt.localeCompare(b.createdAt);
  return createdAtOrder !== 0 ? createdAtOrder : a.id.localeCompare(b.id);
}

function isMessageCreatedEvent(value: unknown): value is MessageCreatedEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<MessageCreatedEvent>;

  return (
    candidate.type === 'message.created' &&
    typeof candidate.conversationId === 'string' &&
    candidate.conversationId.length > 0 &&
    !!candidate.message &&
    typeof candidate.message.id === 'string' &&
    candidate.message.id.length > 0 &&
    typeof candidate.message.senderId === 'string' &&
    candidate.message.senderId.length > 0
  );
}

export function useConversations() {
  return useQuery<ConversationListResponse>({
    queryKey: [QUERY_KEYS.CONVERSATIONS],
    queryFn: async () => {
      const response = await apiClient.get<ConversationListResponse>(
        '/api/chat/conversations/list',
      );
      return response.data;
    },
  });
}

/**
 * Polling stays as a fallback for when realtime is unavailable. Normal updates
 * arrive through invalidation of the `[CONVERSATIONS]` prefix.
 */
export function useUnreadMessageCount(options?: { enabled?: boolean }) {
  return useQuery<number>({
    queryKey: [QUERY_KEYS.CONVERSATIONS, 'unread-count'],
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const response = await apiClient.get<{ unreadCount: number }>(
        '/api/chat/conversations/unread',
      );
      return response.data.unreadCount ?? 0;
    },
  });
}

export function useConversationDetail(id: string | undefined) {
  return useQuery<ConversationDetailResponse>({
    queryKey: [QUERY_KEYS.CONVERSATIONS, id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) {
        throw new Error('conversationId is required');
      }

      const response = await apiClient.get<ConversationDetailResponse>(
        `/api/chat/conversations/${encodeURIComponent(id)}`,
      );
      return response.data;
    },
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery<MessagesResponse>({
    queryKey: [QUERY_KEYS.MESSAGES, conversationId],
    enabled: Boolean(conversationId),
    queryFn: async () => {
      if (!conversationId) {
        throw new Error('conversationId is required');
      }

      const response = await apiClient.get<MessagesResponse>(
        '/api/chat/messages/list',
        { params: { conversationId } },
      );
      return response.data;
    },
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateConversationResponse,
    unknown,
    CreateConversationInput
  >({
    mutationFn: async (input) => {
      const response = await apiClient.post<CreateConversationResponse>(
        '/api/chat/conversations/create',
        input,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONVERSATIONS],
      });
    },
    onError: (error) => {
      toast.error(
        `Error: ${getApiErrorMessage(error, 'Failed to start conversation')}`,
      );
    },
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, unknown, FormData>({
    mutationFn: async (formData) => {
      const response = await apiClient.post<SendMessageResponse>(
        '/api/chat/messages/create',
        formData,
      );
      return response.data;
    },
    onSuccess: (_data, formData) => {
      const conversationId = formData.get('conversationId');

      if (typeof conversationId === 'string' && conversationId.length > 0) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.MESSAGES, conversationId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONVERSATIONS],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CONVERSATIONS],
        });
      }

      toast.error(
        `Error: ${getApiErrorMessage(error, 'Failed to send message')}`,
      );
    },
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<MarkReadResponse, unknown, MarkReadVariables>({
    mutationFn: async ({ conversationId }) => {
      const response = await apiClient.patch<MarkReadResponse>(
        `/api/chat/conversations/${encodeURIComponent(conversationId)}`,
        { action: 'read' },
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONVERSATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MESSAGES, variables.conversationId],
      });
    },
    onError: (error, variables) => {
      if (!variables.silent) {
        toast.error(
          `Error: ${getApiErrorMessage(error, 'Failed to mark as read')}`,
        );
      }
    },
  });
}

/**
 * Subscribes to the current user's Ably channel and keeps the conversation
 * queries in sync. The server remains the source of truth: events only seed the
 * cache, while invalidation refreshes inbox, detail, unread, and read state.
 */
export function useConversationRealtime({
  userId,
  activeConversationId,
}: {
  userId?: string | null;
  activeConversationId?: string | null;
}): { status: ConversationRealtimeStatus } {
  const queryClient = useQueryClient();
  const { mutate: markAsRead } = useMarkAsReadMutation();
  const [status, setStatus] = useState<ConversationRealtimeStatus>('idle');

  const activeConversationIdRef = useRef(activeConversationId ?? null);
  const userIdRef = useRef(userId ?? null);
  const markAsReadRef = useRef(markAsRead);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId ?? null;
  }, [activeConversationId]);

  useEffect(() => {
    userIdRef.current = userId ?? null;
  }, [userId]);

  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  useEffect(() => {
    if (!userId || !activeConversationId) {
      return;
    }

    markAsReadRef.current({
      conversationId: activeConversationId,
      silent: true,
    });
  }, [userId, activeConversationId]);

  useEffect(() => {
    if (!userId) {
      setStatus('idle');
      return;
    }

    let closed = false;
    let hasConnected = false;
    let client: RealtimeClient | null = null;
    let channel: RealtimeChannel | null = null;
    let messageListener: ((message: InboundMessage) => void) | null = null;
    let connectionListener: ((change: ConnectionStateChange) => void) | null =
      null;

    setStatus('connecting');

    const connect = async () => {
      const realtime = await createRealtimeClient({
        authCallback: async (_params, callback) => {
          try {
            const response = await apiClient.get<TokenRequest>(
              '/api/chat/ably/token',
            );
            callback(null, response.data);
          } catch (error) {
            if (!closed) {
              setStatus('unavailable');
            }

            callback(
              getApiErrorMessage(
                error,
                'Unable to authenticate realtime connection',
              ),
              null,
            );
          }
        },
      });

      if (closed) {
        realtime.close();
        return;
      }

      client = realtime;
      const userChannel = realtime.channels.get(getUserChannelName(userId));
      channel = userChannel;

      messageListener = (message) => {
        if (closed || !isMessageCreatedEvent(message.data)) {
          return;
        }

        const event = message.data;
        const messageKey = [QUERY_KEYS.MESSAGES, event.conversationId] as const;
        let needsSenderRefresh = false;

        queryClient.setQueryData<MessagesResponse>(messageKey, (current) => {
          if (!current) {
            return current;
          }

          if (current.messages.some((item) => item.id === event.message.id)) {
            return current;
          }

          const cachedSender = current.messages.find(
            (item) => item.senderId === event.message.senderId,
          )?.sender;
          needsSenderRefresh = !cachedSender;

          const nextMessage: MessageView = {
            ...event.message,
            conversationId: event.conversationId,
            sender: cachedSender ?? {
              id: event.message.senderId,
              name: '',
              imageUrl: null,
            },
          };

          return {
            ...current,
            messages: [...current.messages, nextMessage].sort(compareMessages),
          };
        });

        if (needsSenderRefresh) {
          queryClient.invalidateQueries({ queryKey: messageKey });
        }

        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CONVERSATIONS],
        });

        if (
          event.conversationId === activeConversationIdRef.current &&
          event.message.senderId !== userIdRef.current
        ) {
          markAsReadRef.current({
            conversationId: event.conversationId,
            silent: true,
          });
        }
      };

      connectionListener = (change) => {
        if (closed) {
          return;
        }

        if (change.current === 'connected') {
          if (hasConnected) {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.CONVERSATIONS],
            });

            const activeId = activeConversationIdRef.current;
            if (activeId) {
              queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MESSAGES, activeId],
              });
            }
          }

          hasConnected = true;
          setStatus('connected');
          return;
        }

        if (change.current === 'failed') {
          setStatus('unavailable');
          return;
        }

        if (change.current === 'closing' || change.current === 'closed') {
          setStatus('idle');
          return;
        }

        if (
          change.current === 'disconnected' ||
          change.current === 'suspended'
        ) {
          setStatus(hasConnected ? 'reconnecting' : 'connecting');
          return;
        }

        setStatus(hasConnected ? 'reconnecting' : 'connecting');
      };

      userChannel.subscribe('message.created', messageListener).catch(() => {
        if (!closed) {
          setStatus('unavailable');
        }
      });
      realtime.connection.on(connectionListener);
    };

    void connect().catch(() => {
      if (!closed) {
        setStatus('unavailable');
      }
    });

    return () => {
      closed = true;

      if (channel && messageListener) {
        channel.unsubscribe('message.created', messageListener);
      }

      if (client && connectionListener) {
        client.connection.off(connectionListener);
      }

      client?.close();
    };
  }, [queryClient, userId]);

  return { status };
}
