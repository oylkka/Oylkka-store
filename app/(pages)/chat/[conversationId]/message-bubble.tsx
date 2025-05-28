'use client';

import { format } from 'date-fns';
import { AlertCircle, Check, CheckCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, formatDisplayName, getInitials } from '@/lib/utils';

interface MessageBubbleProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  isCurrentUser: boolean;
  onRetry: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isCurrentUser,
  onRetry,
}: MessageBubbleProps) {
  const formatMessageTime = (date: Date) => {
    return format(date, 'HH:mm');
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

  return (
    <div
      className={cn('flex', isCurrentUser ? 'justify-end' : 'justify-start')}
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
            'relative max-w-full rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl',
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
              isCurrentUser ? 'text-white/70' : 'text-muted-foreground'
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
                    onClick={() => onRetry(message.id)}
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
  );
}
