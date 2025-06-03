'use client';

import { RefreshCw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAbly } from '@/hooks/use-ably';
import { useChatData } from '@/hooks/use-chat-data';
import { useChatMessages } from '@/hooks/use-chat-messages';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { ChatLoadingSkeleton } from './chat-skeleton';
import { ConnectionStatus } from './connection-status';

export function ChatConversation() {
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

  const {
    conversation,
    isLoading: isDataLoading,
    error: dataError,
    refetch: refetchData,
  } = useChatData(conversationId, status);

  const {
    messages,
    isTyping,
    sendMessage,
    retryMessage,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useChatMessages(conversationId, session, ably, isConnected, getChannel);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const handleBackNavigation = () => {
    router.push('/chat');
  };

  const isLoading = isDataLoading || isMessagesLoading;
  const error = dataError || messagesError;

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
                onClick={refetchData}
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

  return (
    <div className="from-background to-muted/20 flex h-full flex-col bg-gradient-to-br">
      <ChatHeader
        conversation={conversation}
        onlineUsers={onlineUsers}
        isConnected={isConnected}
        onBack={handleBackNavigation}
      />

      <ConnectionStatus
        connectionError={connectionError}
        connectionState={connectionState}
      />

      <ChatMessages
        messages={messages}
        conversation={conversation}
        session={session}
        isTyping={isTyping}
        onRetryMessage={retryMessage}
      />

      <ChatInput
        conversation={conversation}
        onSendMessage={sendMessage}
        isConnected={isConnected}
        connectionState={connectionState}
        ably={ably}
        getChannel={getChannel}
        session={session}
      />
    </div>
  );
}
