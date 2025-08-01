'use client';

import { Mic, Paperclip, Send } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDisplayName } from '@/lib/utils';

import { EmojiPicker } from './emoji-picker';

interface ChatInputProps {
  // biome-ignore lint: error
  conversation: any;
  onSendMessage: (content: string) => Promise<void>;
  isConnected: boolean;
  connectionState: string;
  // biome-ignore lint: error
  ably?: any;
  // biome-ignore lint: error
  getChannel?: any;
  // biome-ignore lint: error
  session?: any;
}

export function ChatInput({
  conversation,
  onSendMessage,
  isConnected,
  connectionState,
  ably,
  getChannel,
  session,
}: ChatInputProps) {
  const [messageContent, setMessageContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // biome-ignore lint: error
  const channelRef = useRef<any>(null);
  const conversationId = conversation?.id;

  // Setup channel for typing events
  useEffect(() => {
    if (!ably || !isConnected || !conversationId || !getChannel) {
      return;
    }

    const channelName = `chat:${conversationId}`;
    const channel = getChannel(channelName);
    channelRef.current = channel;

    return () => {
      // Clean up typing indicator on unmount
      if (channelRef.current && session?.user?.id) {
        channelRef.current.publish('typing', {
          userId: session.user.id,
          isTyping: false,
        });
      }
    };
  }, [ably, isConnected, conversationId, getChannel, session?.user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageContent(value);

    // Handle typing indicator
    if (channelRef.current && isConnected && session?.user?.id) {
      const isTyping = value.length > 0;

      // Publish typing start event
      channelRef.current.publish('typing', {
        userId: session.user.id,
        isTyping: isTyping,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          if (channelRef.current && session?.user?.id) {
            channelRef.current.publish('typing', {
              userId: session.user.id,
              isTyping: false,
            });
          }
        }, 1000); // Stop typing after 1 second of inactivity
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !isConnected) {
      return;
    }

    const content = messageContent.trim();
    setMessageContent('');
    setShowEmojiPicker(false);

    // Stop typing indicator immediately when sending
    if (channelRef.current && session?.user?.id) {
      channelRef.current.publish('typing', {
        userId: session.user.id,
        isTyping: false,
      });
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    await onSendMessage(content);
  };

  // biome-ignore lint: error
  const handleEmojiSelect = (emoji: any) => {
    const newContent = messageContent + emoji.native;
    setMessageContent(newContent);
    inputRef.current?.focus();

    // Trigger typing indicator for emoji selection
    if (channelRef.current && isConnected && session?.user?.id) {
      channelRef.current.publish('typing', {
        userId: session.user.id,
        isTyping: true,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        if (channelRef.current && session?.user?.id) {
          channelRef.current.publish('typing', {
            userId: session.user.id,
            isTyping: false,
          });
        }
      }, 1000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const otherUser = conversation?.otherUser;

  return (
    <div className='border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-none border-t backdrop-blur'>
      <div className='p-4'>
        <form onSubmit={handleSubmit} className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            type='button'
            className='hover:bg-accent rounded-full p-2'
          >
            <Paperclip className='text-muted-foreground h-5 w-5' />
          </Button>

          <div className='relative flex-1'>
            <Input
              ref={inputRef}
              type='text'
              value={messageContent}
              onChange={handleInputChange}
              placeholder={`Message ${formatDisplayName(otherUser)}...`}
              className='border-border/50 bg-muted/50 focus:bg-background focus-visible:ring-ring rounded-full pr-12 focus-visible:ring-1'
              disabled={!isConnected}
            />

            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              isOpen={showEmojiPicker}
              onToggle={() => setShowEmojiPicker(!showEmojiPicker)}
            />
          </div>

          {messageContent.trim() ? (
            <Button
              type='submit'
              size='sm'
              className='rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-3 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl'
              disabled={!isConnected}
            >
              <Send className='h-4 w-4' />
            </Button>
          ) : (
            <Button
              type='button'
              size='sm'
              variant='ghost'
              className={cn(
                'rounded-full p-3 transition-all duration-200',
                isRecording
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse'
                  : 'hover:bg-accent',
              )}
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className='h-4 w-4' />
            </Button>
          )}
        </form>

        {!isConnected && (
          <div className='mt-3 text-center'>
            <Badge variant='outline' className='rounded-full px-3 py-1 text-xs'>
              <div className='mr-2 h-2 w-2 animate-pulse rounded-full bg-amber-500' />
              {connectionState === 'connecting'
                ? 'Connecting...'
                : 'Disconnected'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
