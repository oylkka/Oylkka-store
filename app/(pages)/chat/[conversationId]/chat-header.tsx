'use client';

import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDisplayName, getInitials } from '@/lib/utils';
import { usePresenceStore } from '@/store/presenceStore';

interface ChatHeaderProps {
  // biome-ignore lint: error
  conversation: any;
  onBack: () => void;
}

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  const { getUserById, isConnected } = usePresenceStore();
  const otherUser = conversation?.otherUser;
  const isOtherUserOnline = getUserById(otherUser?.id)?.status === 'online';
  const [imageError, setImageError] = useState(false);

  return (
    <div className='border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-none border-b backdrop-blur'>
      <div className='flex items-center justify-between p-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='hover:bg-accent rounded-full p-2 lg:hidden'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>

          <div className='flex items-center gap-3'>
            <div className='relative'>
              <Avatar className='border-background h-10 w-10 border-2 shadow-lg'>
                {otherUser?.image && !imageError ? (
                  <div className='relative h-full w-full overflow-hidden rounded-full'>
                    <Image
                      src={otherUser.image}
                      alt={formatDisplayName(otherUser)}
                      fill
                      className='object-cover'
                      sizes='40px'
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                    />
                  </div>
                ) : (
                  <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white'>
                    {getInitials(formatDisplayName(otherUser))}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <div>
              <h2 className='text-foreground font-semibold'>
                {formatDisplayName(otherUser)}
              </h2>
              <div className='flex items-center text-sm'>
                {isConnected ? (
                  isOtherUserOnline ? (
                    <>
                      <div className='mr-2 h-2 w-2 rounded-full bg-emerald-500' />
                      <span className='text-emerald-600 dark:text-emerald-400'>
                        Online
                      </span>
                    </>
                  ) : (
                    <>
                      <div className='mr-2 h-2 w-2 rounded-full bg-gray-500' />
                      <span className='text-gray-600 dark:text-gray-400'>
                        Offline
                      </span>
                    </>
                  )
                ) : (
                  <>
                    <div className='mr-2 h-2 w-2 animate-pulse rounded-full bg-amber-500' />
                    <span className='text-amber-600 dark:text-amber-400'>
                      Connecting...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-accent rounded-full p-2'
          >
            <Phone className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-accent rounded-full p-2'
          >
            <Video className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-accent rounded-full p-2'
          >
            <MoreVertical className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
