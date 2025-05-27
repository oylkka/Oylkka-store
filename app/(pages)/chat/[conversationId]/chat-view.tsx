/* eslint-disable no-console */
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
import { cn } from '@/lib/utils';

import { ChatLoadingSkeleton } from '../chat-skeleton';

function formatDisplayName(
  user?: { name?: string | null; username?: string | null } | null
): string {
  return user?.name || user?.username || 'Unknown User';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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

export function ImprovedChatView() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { data: session, status } = useSession();

  const {
    ably,
    isConnected,
    getChannel,
    connectionError,
    connectionState,
    onlineUsers,
  } = useAbly(conversationId);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [onlineUserDetails, setOnlineUserDetails] = useState<User[]>([]); // New state for user details
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channelRef = useRef<any>(null);
  const messageListenersRef = useRef<Set<MessageListener>>(new Set());

  // Track pending messages to avoid duplicates
  const pendingMessagesRef = useRef<Set<string>>(new Set());

  // Fetch user details for online users
  const fetchUserDetails = useCallback(async (userIds: string[]) => {
    try {
      const userPromises = userIds.map(async (userId) => {
        const response = await fetch(
          `/api/dashboard/admin/users/single-user?id=${userId}`
        );
        if (response.ok) {
          return response.json() as Promise<User>;
        }
        return { id: userId, username: userId }; // Fallback
      });
      const users = await Promise.all(userPromises);
      setOnlineUserDetails(users);
    } catch (err) {
      console.error('Error fetching user details:', err);
      toast.error('Failed to load user details');
    }
  }, []);

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
      setError(err.message);
      toast.error('Failed to load messages');
    }
  }, [conversationId, status]);

  // Fetch online user details when onlineUsers changes
  useEffect(() => {
    if (isConnected && onlineUsers.length > 0) {
      fetchUserDetails(onlineUsers);
    } else {
      setOnlineUserDetails([]);
    }
  }, [onlineUsers, isConnected, fetchUserDetails]);

  // Setup Ably channel and listeners
  // Step 1: Let's add comprehensive debugging to your useEffect that sets up Ably
  // Replace your existing Ably setup useEffect with this debug version:

  useEffect(() => {
    console.log('🔧 Ably setup useEffect triggered', {
      ably: !!ably,
      isConnected,
      conversationId,
      userId: session?.user?.id,
    });

    if (!ably || !isConnected || !conversationId || !session?.user?.id) {
      console.log('❌ Ably setup conditions not met');
      return;
    }

    const currentMessageListeners = messageListenersRef.current;
    const channelName = `chat:${conversationId}`;
    console.log('📺 Getting channel:', channelName);

    const channel = getChannel(channelName);

    if (!channel) {
      console.warn('❌ Failed to get channel:', channelName);
      return;
    }

    console.log('✅ Channel obtained successfully');
    console.log('📊 Channel state:', channel.state);

    // Clean up previous channel
    if (channelRef.current && channelRef.current !== channel) {
      console.log('🧹 Cleaning up previous channel');
      const previousListeners = new Set(messageListenersRef.current);
      previousListeners.forEach((listener) => {
        channelRef.current!.unsubscribe('message', listener);
      });
      channelRef.current.unsubscribe('read_receipt');
      channelRef.current.unsubscribe('typing');
      channelRef.current.presence.unsubscribe();
      messageListenersRef.current.clear();
    }

    channelRef.current = channel;

    // Enhanced message listener with detailed logging
    const messageListener: MessageListener = (ablyMessage) => {
      console.log('📨 RAW Ably message received:', {
        name: ablyMessage.name,
        data: ablyMessage.data,
        timestamp: new Date().toISOString(),
      });

      if (ablyMessage.name !== 'message') {
        console.log('⚠️ Ignoring non-message event:', ablyMessage.name);
        return;
      }

      const receivedMessage = ablyMessage.data as ClientMessage;

      console.log('📩 Processing message:', {
        id: receivedMessage.id,
        senderId: receivedMessage.senderId,
        content: receivedMessage.content?.substring(0, 50) + '...',
        currentUserId: session.user?.id,
        isFromCurrentUser: receivedMessage.senderId === session.user?.id,
      });

      setMessages((prevMessages) => {
        console.log('📝 Current messages count:', prevMessages.length);

        // Check if message already exists
        const existingMessage = prevMessages.find(
          (msg) => msg.id === receivedMessage.id
        );

        if (existingMessage) {
          console.log('🔄 Message already exists, updating status');
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

        // For messages from current user - try to replace temp message
        if (receivedMessage.senderId === session.user?.id) {
          console.log(
            '👤 Message from current user, looking for temp message to replace'
          );

          const tempMessageIndex = prevMessages.findIndex(
            (msg) =>
              msg.id.startsWith('temp-') &&
              msg.content === receivedMessage.content &&
              msg.senderId === receivedMessage.senderId
          );

          if (tempMessageIndex !== -1) {
            console.log(
              '🔄 Found temp message to replace at index:',
              tempMessageIndex
            );
            return prevMessages.map((msg, index) =>
              index === tempMessageIndex
                ? {
                    ...receivedMessage,
                    createdAt: new Date(receivedMessage.createdAt),
                    status: 'delivered' as const,
                  }
                : msg
            );
          } else {
            console.log('⚠️ No temp message found, adding as new message');
          }
        }

        // Add as new message
        console.log('➕ Adding as new message');
        const newMessages = [
          ...prevMessages,
          {
            ...receivedMessage,
            createdAt: new Date(receivedMessage.createdAt),
            status: 'delivered' as const,
          },
        ];

        console.log('📊 New messages count:', newMessages.length);
        return newMessages;
      });
    };

    // Enhanced typing listener
    const typingListener = (ablyMessage: any) => {
      console.log('⌨️ Typing event received:', ablyMessage.data);
      const { userId, isTyping: typing } = ablyMessage.data;
      if (userId !== session.user?.id) {
        console.log('👥 Setting typing state for other user:', typing);
        setIsTyping(typing);
        if (typing) {
          setTimeout(() => {
            console.log('⏰ Typing timeout reached');
            setIsTyping(false);
          }, 3000);
        }
      }
    };

    // Enhanced read receipt listener
    const readReceiptListener = (ablyMessage: any) => {
      console.log('✅ Read receipt received:', ablyMessage.data);
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

    // Subscribe to events
    console.log('🔔 Subscribing to channel events');
    channel.subscribe('message', messageListener);
    channel.subscribe('read_receipt', readReceiptListener);
    channel.subscribe('typing', typingListener);

    // Test channel connection
    channel
      .publish('test', {
        userId: session.user.id,
        timestamp: new Date().toISOString(),
        message: 'Connection test',
      })
      .then(() => {
        console.log('✅ Test message published successfully');
      })
      .catch((error: any) => {
        console.error('❌ Failed to publish test message:', error);
      });

    messageListenersRef.current.add(messageListener);

    return () => {
      console.log('🧹 Cleaning up Ably subscriptions');
      if (channelRef.current) {
        channelRef.current.unsubscribe('message', messageListener);
        channelRef.current.unsubscribe('read_receipt', readReceiptListener);
        channelRef.current.unsubscribe('typing', typingListener);
      }
      currentMessageListeners.delete(messageListener);
    };
  }, [
    ably,
    isConnected,
    conversationId,
    session?.user?.id,
    getChannel,
    session,
  ]);

  // Step 2: Enhanced handleSendMessage with debugging
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    console.log('📤 handleSendMessage called');

    if (!newMessageContent.trim() || !session?.user?.id || !conversationId) {
      console.log('❌ Message send conditions not met:', {
        hasContent: !!newMessageContent.trim(),
        hasUserId: !!session?.user?.id,
        hasConversationId: !!conversationId,
      });
      return;
    }

    const content = newMessageContent.trim();
    setNewMessageContent('');

    console.log('📝 Sending message:', {
      content: content.substring(0, 50) + '...',
      conversationId,
      userId: session.user.id,
    });

    // Stop typing indicator
    if (channelRef.current && isConnected) {
      console.log('⌨️ Publishing typing stop event');
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

    console.log('🔄 Adding optimistic message:', tempId);
    setMessages((prev) => {
      console.log('📊 Adding temp message, prev count:', prev.length);
      return [...prev, tempMessage];
    });

    try {
      console.log('🌐 Calling sendMessage API...');
      const savedMessage = await sendMessage(conversationId, content);
      console.log('✅ Message saved to server:', {
        id: savedMessage.id,
        tempId,
        content: savedMessage.content?.substring(0, 50) + '...',
      });

      // Update temp message with real message data
      setMessages((prev) => {
        console.log('🔄 Replacing temp message with real message');
        const updated = prev.map((msg) =>
          msg.id === tempId
            ? {
                ...savedMessage,
                createdAt: new Date(savedMessage.createdAt),
                status: 'sent' as const,
              }
            : msg
        );
        console.log('📊 Updated messages count:', updated.length);
        return updated;
      });

      // Publish to Ably channel for real-time updates
      if (channelRef.current && isConnected) {
        console.log('📡 Publishing message to Ably channel');
        try {
          await channelRef.current.publish('message', {
            ...savedMessage,
            createdAt: savedMessage.createdAt, // Keep as string for Ably
          });
          console.log('✅ Message published to Ably successfully');
        } catch (ablyError) {
          console.error('❌ Failed to publish to Ably:', ablyError);
        }
      } else {
        console.warn('⚠️ Cannot publish to Ably - channel not ready:', {
          hasChannel: !!channelRef.current,
          isConnected,
        });
      }
    } catch (err: any) {
      console.error('❌ Error sending message:', err);
      toast.error('Failed to send message');

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'failed' as const } : msg
        )
      );
    }
  };

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

    if (channelRef.current && isConnected) {
      channelRef.current.publish('typing', {
        userId: session?.user?.id,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  // Improved message sending logic
  // PART 1: Replace your existing messageListener with this improved version:

  // PART 2: Also update your handleSendMessage function with this improved version:

  // PART 2: Improved handleSendMessage function:

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

  const handleBackNavigation = () => {
    router.push('/chat');
  };

  if (isLoading) {
    return <ChatLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="from-background to-muted/20 flex h-full items-center justify-center bg-gradient-to-br">
        <Card className="bg-background/80 border-0 shadow-xl backdrop-blur-sm">
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
                onClick={handleBackNavigation}
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
  const isOtherUserOnline = otherUser?.id && onlineUsers.includes(otherUser.id);

  return (
    <div className="from-background to-muted/20 flex h-full flex-col bg-gradient-to-br">
      {/* Chat Header */}
      <div className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-none border-b backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackNavigation}
              className="hover:bg-accent rounded-full p-2 lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="border-background h-10 w-10 border-2 shadow-lg">
                  <AvatarImage
                    src={otherUser?.image || undefined}
                    alt={formatDisplayName(otherUser)}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white">
                    {getInitials(formatDisplayName(otherUser))}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div>
                <h2 className="text-foreground font-semibold">
                  {formatDisplayName(otherUser)}
                </h2>
                <div className="flex items-center text-sm">
                  {isConnected ? (
                    isOtherUserOnline ? (
                      <>
                        <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Online
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="mr-2 h-2 w-2 rounded-full bg-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Offline
                        </span>
                      </>
                    )
                  ) : (
                    <>
                      <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">
                        Connecting...
                      </span>
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
              className="hover:bg-accent rounded-full p-2"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-accent rounded-full p-2"
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-accent rounded-full p-2"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

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

      {/* Online Users (Optional for Multi-User Conversations) */}
      {onlineUserDetails.length > 0 && (
        <div className="mx-4 mt-2">
          <Card className="bg-background/80">
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold">Online Users</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {onlineUserDetails.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={formatDisplayName(user)}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-medium text-white">
                        {getInitials(formatDisplayName(user))}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{formatDisplayName(user)}</span>
                    <Badge variant="success" className="text-xs">
                      Online
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6">
            {messages.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser?.image || undefined} />
                    <AvatarFallback className="bg-transparent font-medium text-white">
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
                          className="bg-muted/80 text-muted-foreground rounded-full px-3 py-1 text-xs backdrop-blur-sm"
                        >
                          {formatMessageDate(message.createdAt)}
                        </Badge>
                      </div>
                    )}

                    <div
                      className={cn(
                        'flex',
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'flex max-w-[75%] items-end gap-3',
                          isCurrentUser ? 'flex-row-reverse' : ''
                        )}
                      >
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 flex-shrink-0 shadow-sm">
                            <AvatarImage
                              src={message.sender.image || undefined}
                              alt={formatDisplayName(message.sender)}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-medium text-white">
                              {getInitials(formatDisplayName(message.sender))}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={cn(
                            'relative max-w-full rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm',
                            isCurrentUser
                              ? 'rounded-br-md bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-background/80 border-border/50 text-foreground rounded-bl-md border'
                          )}
                        >
                          <p className="text-sm leading-relaxed break-words">
                            {message.content}
                          </p>
                          <div
                            className={cn(
                              'mt-2 flex items-center justify-end gap-2',
                              isCurrentUser
                                ? 'text-white/70'
                                : 'text-muted-foreground'
                            )}
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
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-medium text-white">
                      {getInitials(formatDisplayName(otherUser))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="border-border/50 bg-background/80 rounded-2xl rounded-bl-md border px-4 py-3 shadow-lg backdrop-blur-sm">
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
      </div>

      {/* Message Input */}
      <div className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-none border-t backdrop-blur">
        <div className="p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3"
          >
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="hover:bg-accent rounded-full p-2"
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
                className="border-border/50 bg-muted/50 focus:bg-background focus-visible:ring-ring rounded-full pr-12 focus-visible:ring-1"
                disabled={!isConnected}
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="hover:bg-accent absolute top-1/2 right-2 -translate-y-1/2 transform rounded-full p-1"
              >
                <Smile className="text-muted-foreground h-4 w-4" />
              </Button>
            </div>

            {newMessageContent.trim() ? (
              <Button
                type="submit"
                size="sm"
                className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-3 shadow-lg transition-all duration-200 hover:shadow-xl"
                disabled={!isConnected}
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={cn(
                  'rounded-full p-3 transition-all duration-200',
                  isRecording
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'hover:bg-accent'
                )}
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
                <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                {connectionState === 'connecting'
                  ? 'Connecting...'
                  : 'Disconnected'}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
