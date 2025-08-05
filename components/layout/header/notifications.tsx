'use client';

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
import { useState } from 'react';

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
import { cn } from '@/lib/utils';

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
  timestamp: string;
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

// Static data
const staticNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #12345 has been shipped and is on its way!',
    timestamp: '2 minutes ago',
    isRead: false,
    avatar: '/placeholder.svg?height=32&width=32',
  },
  {
    id: '2',
    type: 'success',
    title: 'Payment Successful',
    message: 'Your payment of ৳2,450 has been processed successfully.',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Johnson sent you a message about your recent order.',
    timestamp: '3 hours ago',
    isRead: true,
    avatar: '/placeholder.svg?height=32&width=32',
  },
  {
    id: '4',
    type: 'warning',
    title: 'Low Stock Alert',
    message:
      'The item "Summer Dress" in your wishlist is running low on stock.',
    timestamp: '5 hours ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'New Collection Available',
    message:
      'Check out our latest Winter Collection with 25% off on all items.',
    timestamp: '1 day ago',
    isRead: true,
  },
];

// Simple notification sound
const playNotificationSound = (enabled: boolean) => {
  if (!enabled) return;

  try {
    const audioContext = new // biome-ignore lint: error
    (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant ascending chime (C-E-G)
    oscillator.frequency.value = 523; // C5
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.15,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);

    // E5
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 659;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15,
      );
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.15);
    }, 100);

    // G5
    setTimeout(() => {
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.frequency.value = 784;
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2,
      );
      osc3.start(audioContext.currentTime);
      osc3.stop(audioContext.currentTime + 0.2);
    }, 200);
  } catch (error) {
    // biome-ignore lint: error
    console.warn('Could not play notification sound:', error);
  }
};

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(staticNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => setNotifications([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      // Play test sound when enabling
      setTimeout(() => playNotificationSound(true), 100);
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

            {notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={markAllAsRead}
                    className='h-7 w-7 p-0'
                    title='Mark all as read'
                  >
                    <Check className='h-3 w-3' />
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearAll}
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
          {notifications.length === 0 ? (
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
              {notifications.map((notification) => (
                // biome-ignore lint: error
                <div
                  key={notification.id}
                  className={cn(
                    'group relative p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                    !notification.isRead && 'bg-primary/5',
                  )}
                  onClick={() => markAsRead(notification.id)}
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
                            {notification.timestamp}
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
        {notifications.length > 0 && (
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
