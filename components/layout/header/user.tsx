'use client';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotification } from '@/hooks/use-notification';
import { useUnreadMessageCount } from '@/hooks/use-unread-messages';
import { getInitials } from '@/lib/utils';
import { notificationSound } from '@/utils/notification-sound';
import { SignOut } from './logout';

export default function UserDropDown() {
  const { data: session } = useSession();
  const { unreadCount } = useUnreadMessageCount();
  const { getChannel } = useNotification(session?.user?.id ?? null);

  useEffect(() => {
    if (session?.user?.id) {
      const channelName = `private:unread_count:${session.user.id}`;
      const channel = getChannel(channelName);

      if (channel) {
        const handleUpdate = () => {
          notificationSound(true);
          toast('You have a new message!', {
            icon: '✉️',
          });
        };

        channel.subscribe('unread_update', handleUpdate);

        return () => {
          channel.unsubscribe('unread_update', handleUpdate);
        };
      }
    }
  }, [session?.user?.id, getChannel]);
  return (
    <div className='pl-2'>
      {session?.user ? (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className='relative'>
                <Avatar className='border-primary/20 hover:border-primary/40 h-9 w-9 cursor-pointer border-2 transition-all'>
                  <AvatarImage
                    // biome-ignore lint: error
                    src={session.user.image! || '/placeholder.svg'}
                    alt={session.user.name || 'User avatar'}
                  />
                  <AvatarFallback className='bg-primary/10 text-primary'>
                    {getInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
                {unreadCount > 0 && (
                  <Badge className='absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-bold'>
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56'
              align='end'
              forceMount
              sideOffset={8}
            >
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm leading-none font-medium'>
                    {session.user.name}
                  </p>
                  <p className='text-muted-foreground text-xs leading-none'>
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href='/dashboard'
                  className='flex w-full cursor-pointer items-center'
                >
                  <LayoutDashboard className='text-primary/70 mr-2 h-4 w-4' />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/chat'
                  className='flex w-full cursor-pointer items-center justify-between'
                >
                  <div className='flex items-center gap-2'>
                    <MessageSquare className='text-primary/70 mr-2 h-4 w-4' />
                    Messages
                  </div>
                  {unreadCount > 0 && (
                    <Badge className='ml-2 px-2 py-0.5 text-xs font-bold'>
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/dashboard/profile/edit-profile'
                  className='flex w-full cursor-pointer items-center'
                >
                  <Settings className='text-primary/70 mr-2 h-4 w-4' />
                  Edit Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/dashboard/profile'
                  className='flex w-full cursor-pointer items-center'
                >
                  <UserIcon className='text-primary/70 mr-2 h-4 w-4' />
                  Account Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SignOut />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Link href='/sign-in'>
          <Button size='sm'>Sign In</Button>
        </Link>
      )}
    </div>
  );
}
