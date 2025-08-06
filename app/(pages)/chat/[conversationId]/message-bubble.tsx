'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, formatDisplayName, getInitials } from '@/lib/utils';
import { format } from 'date-fns';
import { AlertCircle, Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface MessageBubbleProps {
  // biome-ignore lint: error
  message: any;
  isCurrentUser: boolean;
  onRetry: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isCurrentUser,
  onRetry,
}: MessageBubbleProps) {
  const [imageError, setImageError] = useState(false);

  const formatMessageTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return (
          <div className='h-3 w-3 animate-spin rounded-full border border-current border-t-transparent' />
        );
      case 'sent':
        return <Check className='h-3 w-3' />;
      case 'delivered':
        return <CheckCheck className='h-3 w-3' />;
      case 'read':
        return <CheckCheck className='h-3 w-3 text-green-500' />;
      case 'failed':
        return <AlertCircle className='text-destructive h-3 w-3' />;
      default:
        return <Check className='h-3 w-3' />;
    }
  };

  const renderAvatar = () => {
    if (isCurrentUser) return null;
    return (
      <Avatar className='h-8 w-8 flex-shrink-0 shadow-sm'>
        {message.sender?.image && !imageError ? (
          <div className='relative h-full w-full overflow-hidden rounded-full'>
            <Image
              src={message.sender.image || '/placeholder.svg'}
              alt={formatDisplayName(message.sender)}
              fill
              className='object-cover'
              sizes='32px'
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          </div>
        ) : (
          <AvatarFallback className='text-xs'>
            {getInitials(formatDisplayName(message.sender))}
          </AvatarFallback>
        )}
      </Avatar>
    );
  };

  const renderMessageStatus = () => {
    if (!isCurrentUser) return null;
    return (
      <div className='flex items-center gap-1'>
        {getMessageStatusIcon(message.status)}
        {message.status === 'failed' && (
          <Button
            size='sm'
            variant='ghost'
            className='h-auto p-0 text-xs hover:bg-transparent hover:text-current'
            onClick={() => onRetry(message.id)}
          >
            Retry
          </Button>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex mb-2', // Reduced margin-bottom
        isCurrentUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'flex max-w-[75%] items-end gap-2', // Reduced gap
          isCurrentUser ? 'flex-row-reverse' : '',
        )}
      >
        {renderAvatar()}
        <div
          className={cn(
            'relative max-w-full rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl', // Reduced padding and rounded-xl for a slightly tighter look
            isCurrentUser
              ? 'rounded-br-none bg-slate-950 text-white dark:bg-black'
              : 'bg-background/80 dark:bg-secondary text-foreground rounded-bl-none border border-border/50',
          )}
        >
          <p className='text-sm leading-relaxed break-words whitespace-pre-wrap'>
            {message.content}
          </p>
          <div className='text-muted-foreground dark:text-accent-foreground mt-1 flex items-center justify-end gap-2'>
            <span className='text-xs opacity-70'>
              {formatMessageTime(message.createdAt)}
            </span>
            {renderMessageStatus()}
          </div>
        </div>
      </div>
    </div>
  );
}
