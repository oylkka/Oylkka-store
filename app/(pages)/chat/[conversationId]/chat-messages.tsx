'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { useEffect, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { EmptyChat } from './empty-chat';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';

interface ChatMessagesProps {
  // biome-ignore lint: error
  messages: any[];
  // biome-ignore lint: error
  conversation: any;
  // biome-ignore lint: error
  session: any;
  isTyping: boolean;
  onRetryMessage: (messageId: string) => void;
}

export function ChatMessages({
  messages,
  conversation,
  session,
  isTyping,
  onRetryMessage,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint: error
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <div className='flex-1 overflow-hidden'>
      <ScrollArea className='h-full'>
        <div className='space-y-6 p-6'>
          {messages.length === 0 ? (
            <EmptyChat otherUser={conversation?.otherUser} />
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
                    <div className='my-6 flex justify-center'>
                      <Badge
                        variant='secondary'
                        className='bg-muted/80 text-muted-foreground rounded-full px-3 py-1 text-xs backdrop-blur-sm'
                      >
                        {formatMessageDate(message.createdAt)}
                      </Badge>
                    </div>
                  )}

                  <MessageBubble
                    message={message}
                    isCurrentUser={isCurrentUser}
                    onRetry={onRetryMessage}
                  />
                </div>
              );
            })
          )}

          {isTyping && <TypingIndicator otherUser={conversation?.otherUser} />}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
