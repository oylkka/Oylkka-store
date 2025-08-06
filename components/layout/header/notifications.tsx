'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Info,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/hooks/use-notification';
import { cn } from '@/lib/utils';
import { notificationSound } from '@/utils/notification-sound';

type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'order'
  | 'message';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  avatar?: string;
  actionUrl?: string;
};

// Configuration objects
const NOTIFICATION_ICONS = {
  success: <CheckCircle className='h-4 w-4 text-green-500' />,
  warning: <AlertTriangle className='h-4 w-4 text-yellow-500' />,
  error: <X className='h-4 w-4 text-red-500' />,
  info: <Info className='h-4 w-4 text-blue-500' />,
  order: <CheckCircle className='h-4 w-4 text-purple-500' />,
  message: <Info className='h-4 w-4 text-indigo-500' />,
};

export default function Notifications() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications, error } = useQuery<Notification[]>({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const { getChannel } = useNotification(session?.user?.id ?? null);

  useEffect(() => {
    if (session?.user?.id) {
      const channel = getChannel(`user:${session.user.id}`);
      if (channel) {
        channel.subscribe('new-notification', () => {
          queryClient.invalidateQueries({
            queryKey: ['notifications', session.user.id],
          });
        });
      }
    }
  }, [session?.user?.id, getChannel, queryClient]);

  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const prevNotificationCount = useRef(notifications?.length ?? 0);

  useEffect(() => {
    if (notifications && notifications.length > prevNotificationCount.current) {
      notificationSound(soundEnabled);
    }
    prevNotificationCount.current = notifications?.length ?? 0;
  }, [notifications, soundEnabled]);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', session?.user?.id],
      });
    },
  };

  const { mutate: markAsRead } = useMutation<unknown, Error, string>({
    mutationFn: (id) =>
      fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      }),
    ...mutationOptions,
  });

  const { mutate: markAllAsRead } = useMutation<unknown, Error, void>({
    mutationFn: () =>
      fetch('/api/notifications/read-all', {
        method: 'PATCH',
      }),
    ...mutationOptions,
  });

  const { mutate: clearAll } = useMutation<unknown, Error, void>({
    mutationFn: () =>
      fetch('/api/notifications/delete-all', {
        method: 'DELETE',
      }),
    ...mutationOptions,
  });

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const { mutate: removeNotification } = useMutation<unknown, Error, string>({
    mutationFn: (id) =>
      fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      }),
    ...mutationOptions,
  });

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      // Play test sound when enabling
      setTimeout(() => notificationSound(true), 100);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='hover:bg-primary/10 relative rounded-full transition-all'
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs shadow-sm animate-in zoom-in-50 duration-200'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className='sr-only'>Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-80 p-0 shadow-lg border-0 bg-background/95 backdrop-blur-sm'
        align='end'
        sideOffset={8}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-lg'>Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant='secondary' className='text-xs'>
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-0.5'>
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleSound}
              className={cn(
                'h-7 w-7 p-0',
                soundEnabled
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:bg-gray-50',
              )}
              title={
                soundEnabled
                  ? 'Disable notification sounds'
                  : 'Enable notification sounds'
              }
            >
              {soundEnabled ? (
                <Volume2 className='h-3 w-3' />
              ) : (
                <VolumeX className='h-3 w-3' />
              )}
            </Button>

            {notifications && notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => markAllAsRead()}
                    className='h-7 w-7 p-0'
                    title='Mark all as read'
                  >
                    <Check className='h-3 w-3' />
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => clearAll()}
                  className='h-7 w-7 p-0 text-red-500 hover:bg-red-50'
                  title='Clear all notifications'
                >
                  <Trash2 className='h-3 w-3' />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className='h-[400px]'>
          {!notifications && !error ? (
            <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
              <div className='rounded-full bg-muted p-3 mb-3'>
                <Bell className='h-6 w-6 text-muted-foreground' />
              </div>
              <h4 className='font-medium text-sm mb-1'>Loading...</h4>
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
              <div className='rounded-full bg-muted p-3 mb-3'>
                <AlertTriangle className='h-6 w-6 text-red-500' />
              </div>
              <h4 className='font-medium text-sm mb-1'>
                Error loading notifications
              </h4>
            </div>
          ) : notifications && notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
              <div className='rounded-full bg-muted p-3 mb-3'>
                <Bell className='h-6 w-6 text-muted-foreground' />
              </div>
              <h4 className='font-medium text-sm mb-1'>No notifications</h4>
              <p className='text-xs text-muted-foreground'>
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <div className='divide-y'>
              {notifications?.map((notification) => (
                // biome-ignore lint: error
                <div
                  key={notification.id}
                  className={cn(
                    'group relative p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                    !notification.isRead && 'bg-primary/5',
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className='flex items-start gap-3'>
                    {notification.avatar ? (
                      <Avatar className='h-8 w-8 flex-shrink-0'>
                        <AvatarImage
                          src={notification.avatar || '/placeholder.svg'}
                          alt=''
                        />
                        <AvatarFallback className='text-xs'>
                          {NOTIFICATION_ICONS[notification.type]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className='flex-shrink-0 mt-1'>
                        {NOTIFICATION_ICONS[notification.type]}
                      </div>
                    )}

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1'>
                          <p className='font-medium text-sm leading-tight'>
                            {notification.title}
                          </p>
                          <p className='text-xs text-muted-foreground mt-1 leading-relaxed'>
                            {notification.message}
                          </p>
                          <p className='text-xs text-muted-foreground mt-2'>
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className='flex items-center gap-1'>
                          {!notification.isRead && (
                            <div className='h-2 w-2 bg-primary rounded-full flex-shrink-0' />
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className='opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600'
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications && notifications.length > 0 && (
          <>
            <Separator />
            <div className='p-3'>
              <Button
                variant='ghost'
                className='w-full text-sm h-8 text-primary hover:text-primary hover:bg-primary/10'
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
