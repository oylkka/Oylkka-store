/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { format, isToday, isYesterday } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  RefreshCw,
  Send,
  Smile,
  Video,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

import { markMessagesAsRead, sendMessage } from '@/actions/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAbly } from '@/hooks/use-ably';
import { getInitials } from '@/lib/utils';

function formatDisplayName(
  user?: { name?: string | null; username?: string | null } | null
): string {
  if (!user) {
    return 'Unknown User';
  }
  return user.name || user.username || 'Unknown User';
}

interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
}

interface ClientMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: User;
  readBy?: string[];
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface Conversation {
  id: string;
  otherUser: User;
  createdAt: string;
  lastMessageAt: string;
}

type MessageListener = (message: any) => void;

export default function ImprovedChatView() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { data: session, status } = useSession();

  const { ably, isConnected, getChannel, connectionError, connectionState } =
    useAbly(conversationId);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);
  const messageListenersRef = useRef<Set<MessageListener>>(new Set());

  // Track pending messages to avoid duplicates
  const pendingMessagesRef = useRef<Set<string>>(new Set());

  // Fetch conversation details
  const fetchConversation = useCallback(async () => {
    if (!conversationId || status !== 'authenticated') {
      return;
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch conversation: ${response.status} - ${errorText}`
        );
      }

      const data: Conversation = await response.json();
      setConversation(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load conversation details');
    }
  }, [conversationId, status]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId || status !== 'authenticated') {
      return;
    }

    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch messages: ${response.status} - ${errorText}`
        );
      }

      const data: ClientMessage[] = await response.json();

      const processedMessages = data.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
        status: 'read' as const,
      }));

      setMessages(processedMessages);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
      toast.error('Failed to load messages');
    }
  }, [conversationId, status]);

  // Setup Ably channel and listeners
  useEffect(() => {
    if (!ably || !isConnected || !conversationId || !session?.user?.id) {
      return;
    }

    const channelName = `private:chat:${conversationId}`;
    const channel = getChannel(channelName);

    if (!channel) {
      console.warn('Failed to get channel:', channelName);
      return;
    }

    // Clean up previous channel
    if (channelRef.current && channelRef.current !== channel) {
      const previousListeners = new Set(messageListenersRef.current); // ✅ Copy for cleanup
      previousListeners.forEach((listener) => {
        channelRef.current!.unsubscribe('message', listener);
      });
      channelRef.current.unsubscribe('read_receipt');
      channelRef.current.unsubscribe('typing');
      channelRef.current.presence.unsubscribe();
      messageListenersRef.current.clear();
    }

    channelRef.current = channel;

    // Message listener
    const messageListener: MessageListener = (ablyMessage) => {
      const receivedMessage = ablyMessage.data as ClientMessage;

      if (receivedMessage.senderId === session.user?.id) {
        if (pendingMessagesRef.current.has(receivedMessage.id)) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (
                msg.id.startsWith('temp-') &&
                msg.content === receivedMessage.content &&
                msg.senderId === receivedMessage.senderId
              ) {
                pendingMessagesRef.current.delete(receivedMessage.id);
                return {
                  ...receivedMessage,
                  createdAt: new Date(receivedMessage.createdAt),
                  status: 'delivered' as const,
                };
              }
              return msg;
            })
          );
        }
        return;
      }

      setMessages((prevMessages) => {
        const exists = prevMessages.some(
          (msg) => msg.id === receivedMessage.id
        );
        if (!exists) {
          return [
            ...prevMessages,
            {
              ...receivedMessage,
              createdAt: new Date(receivedMessage.createdAt),
              status: 'delivered',
            },
          ];
        }
        return prevMessages;
      });
    };

    // Read receipt listener
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

    // Typing indicator listener
    const typingListener = (ablyMessage: any) => {
      const { userId, isTyping: typing } = ablyMessage.data;
      if (userId !== session.user?.id) {
        setIsTyping(typing);
        if (typing) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    // Subscribe to events
    channel.subscribe('message', messageListener);
    channel.subscribe('read_receipt', readReceiptListener);
    channel.subscribe('typing', typingListener);
    channel.presence.subscribe(['enter', 'leave'], () => {});

    messageListenersRef.current.add(messageListener);
    channel.presence.enter({ status: 'online' });

    // ✅ Capture ref snapshot for cleanup
    const cleanupListenersRef = messageListenersRef.current;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe('message', messageListener);
        channelRef.current.unsubscribe('read_receipt', readReceiptListener);
        channelRef.current.unsubscribe('typing', typingListener);
        channelRef.current.presence.unsubscribe(['enter', 'leave'], () => {});
        channelRef.current.presence.leave();
      }
      cleanupListenersRef.delete(messageListener); // ✅ Use captured ref
    };
  }, [
    ably,
    isConnected,
    conversationId,
    session?.user?.id,
    getChannel,
    session,
  ]);

  // Initial data fetch
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch both conversation and messages in parallel
        await Promise.all([fetchConversation(), fetchMessages()]);
      } catch (err: any) {
        console.error('Error loading chat data:', err);
        setError('Failed to load chat data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [status, fetchConversation, fetchMessages, router]);

  // Auto-scroll and mark as read
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

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

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessageContent(e.target.value);

    // Send typing indicator
    if (channelRef.current && isConnected) {
      channelRef.current.publish('typing', {
        userId: session?.user?.id,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  // FIXED: Improved message sending logic
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !session?.user?.id || !conversationId) {
      return;
    }

    const content = newMessageContent.trim();
    setNewMessageContent('');

    // Clear typing indicator
    if (channelRef.current && isConnected) {
      channelRef.current.publish('typing', {
        userId: session.user.id,
        isTyping: false,
      });
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage: ClientMessage = {
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

    // Optimistically add message
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const savedMessage = await sendMessage(conversationId, content);

      // Track this message to handle the Ably echo
      pendingMessagesRef.current.add(savedMessage.id);

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

      // Clean up pending reference after some time (fallback)
      setTimeout(() => {
        pendingMessagesRef.current.delete(savedMessage.id);
      }, 5000);
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'failed' as const } : msg
        )
      );
    }
  };

  const retryFailedMessage = async (messageId: string) => {
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
      const savedMessage = await sendMessage(conversationId, message.content);

      // Track this message to handle the Ably echo
      pendingMessagesRef.current.add(savedMessage.id);

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

      // Clean up pending reference after some time (fallback)
      setTimeout(() => {
        pendingMessagesRef.current.delete(savedMessage.id);
      }, 5000);
    } catch (err: any) {
      console.error('Error retrying message:', err);
      toast.error('Failed to retry message');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'failed' } : msg
        )
      );
    }
  };

  const formatMessageTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return (
          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
        );
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="text-destructive h-3 w-3" />;
      default:
        return <Check className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="bg-card/80 border p-8 shadow-xl backdrop-blur-sm">
          <CardContent className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            <p className="text-muted-foreground">Loading chat...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="bg-card/80 border shadow-xl backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => {
                  fetchConversation();
                  fetchMessages();
                }}
                variant="outline"
                className="rounded-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="rounded-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const otherUser = conversation?.otherUser;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto flex h-screen max-w-4xl flex-col">
        {/* Chat Header */}
        <Card className="bg-card/90 flex-none border-0 shadow-xl backdrop-blur-md">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="hover:bg-muted rounded-full p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="border-background h-12 w-12 border-2 shadow-lg">
                      <AvatarImage
                        src={otherUser?.image || undefined}
                        alt={formatDisplayName(otherUser)}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(formatDisplayName(otherUser))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="border-background absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 bg-green-500 shadow-sm" />
                  </div>

                  <div>
                    <h2 className="text-foreground font-semibold">
                      {formatDisplayName(otherUser)}
                    </h2>
                    <div className="flex items-center text-sm">
                      {isConnected ? (
                        <>
                          <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-green-600">Online</span>
                        </>
                      ) : (
                        <>
                          <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                          <span className="text-yellow-600">Connecting...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-muted rounded-full p-2"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-muted rounded-full p-2"
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-muted rounded-full p-2"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Connection Status */}
        {connectionError && (
          <div className="mx-4 mt-2">
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-destructive h-4 w-4" />
                  <span className="text-destructive text-sm">
                    {connectionError}
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Messages Area */}
        <Card className="bg-card/50 mx-4 my-2 flex-1 overflow-hidden border shadow-xl backdrop-blur-sm">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-6">
              {messages.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser?.image || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(formatDisplayName(otherUser))}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Start a conversation with {formatDisplayName(otherUser)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Send a message to get the conversation started!
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.senderId === session?.user?.id;
                  const showDate =
                    index === 0 ||
                    formatMessageDate(message.createdAt) !==
                      formatMessageDate(messages[index - 1].createdAt);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="my-6 flex justify-center">
                          <Badge
                            variant="secondary"
                            className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs"
                          >
                            {formatMessageDate(message.createdAt)}
                          </Badge>
                        </div>
                      )}

                      <div
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`flex max-w-[75%] items-end gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                        >
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8 flex-shrink-0 shadow-sm">
                              <AvatarImage
                                src={message.sender.image || undefined}
                                alt={formatDisplayName(message.sender)}
                              />
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {getInitials(formatDisplayName(message.sender))}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`relative max-w-full rounded-2xl px-4 py-3 shadow-lg ${
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted text-foreground rounded-bl-md border'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">
                              {message.content}
                            </p>
                            <div
                              className={`mt-2 flex items-center justify-end gap-2 ${
                                isCurrentUser
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              <span className="text-xs">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {isCurrentUser && (
                                <div className="flex items-center gap-1">
                                  {getMessageStatusIcon(message.status)}
                                  {message.status === 'failed' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-auto p-0 text-xs hover:bg-transparent"
                                      onClick={() =>
                                        retryFailedMessage(message.id)
                                      }
                                    >
                                      Retry
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-3">
                    <Avatar className="h-8 w-8 shadow-sm">
                      <AvatarImage src={otherUser?.image || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getInitials(formatDisplayName(otherUser))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-md border px-4 py-3 shadow-lg">
                      <div className="flex space-x-1">
                        <div className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full" />
                        <div
                          className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full"
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full"
                          style={{ animationDelay: '0.2s' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>

        {/* Message Input */}
        <Card className="bg-card/90 flex-none border-0 shadow-xl backdrop-blur-md">
          <div className="p-4">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3"
            >
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="hover:bg-muted rounded-full p-2"
              >
                <Paperclip className="text-muted-foreground h-5 w-5" />
              </Button>

              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  value={newMessageContent}
                  onChange={handleInputChange}
                  placeholder={`Message ${formatDisplayName(otherUser)}...`}
                  className="border-input bg-muted/50 focus:bg-background rounded-full pr-12"
                  disabled={!isConnected}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 transform rounded-full p-1"
                >
                  <Smile className="text-muted-foreground h-4 w-4" />
                </Button>
              </div>

              {newMessageContent.trim() ? (
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full p-3 shadow-lg transition-all duration-200"
                  disabled={!isConnected}
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`rounded-full p-3 transition-all duration-200 ${
                    isRecording
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
            </form>

            {!isConnected && (
              <div className="mt-3 text-center">
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs"
                >
                  <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                  {connectionState === 'connecting'
                    ? 'Connecting...'
                    : 'Disconnected'}
                </Badge>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
