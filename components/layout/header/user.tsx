import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/features/auth/auth';
import { getInitials } from '@/lib/utils';

import { SignOut } from './logout';

export default async function UserDropDown() {
  const session = await auth();
  return (
    <div className='pl-2'>
      {session?.user ? (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
