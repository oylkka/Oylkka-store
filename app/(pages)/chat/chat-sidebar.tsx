'use client';

import { format, isThisWeek, isToday, isYesterday } from 'date-fns';
import { MessageCircle, Plus, Search, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { usePresenceStore } from '@/store/presenceStore';

interface User {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface MessageForPreview {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface ConversationDisplay {
  id: string;
  user1Id: string;
  user2Id: string;
  user1: User;
  user2: User;
  lastMessageAt: Date;
  messages: MessageForPreview[];
}

import { useConversations } from '@/hooks/use-conversations';

interface ChatSidebarProps {
  currentUserId: string;
}

export function ChatSidebar({ currentUserId }: ChatSidebarProps) {
  const params = useParams();
  const currentConversationId = params.conversationId as string;
  const { state } = useSidebar();
  const { getUserById } = usePresenceStore();
  const { conversations, error } = useConversations();

  const getRecipient = (conv: ConversationDisplay) => {
    return conv.user1Id === currentUserId ? conv.user2 : conv.user1;
  };

  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className='border-border/40 border-r'>
      <SidebarHeader className='border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur'>
        <div className='flex items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2'>
            <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-lg'>
              <MessageCircle className='text-primary-foreground h-4 w-4' />
            </div>
            {state === 'expanded' && (
              <h1 className='text-foreground text-lg font-semibold'>
                Messages
              </h1>
            )}
          </div>
          {state === 'expanded' && (
            <Button
              size='sm'
              variant='ghost'
              className='h-8 w-8 rounded-full p-0'
            >
              <Plus className='h-4 w-4' />
            </Button>
          )}
        </div>

        {state === 'expanded' && (
          <div className='px-4 pb-3'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Search conversations...'
                className='bg-muted/50 focus-visible:ring-ring h-9 border-0 pl-9 focus-visible:ring-1'
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {state === 'expanded' && (
            <SidebarGroupLabel className='text-muted-foreground px-4 text-xs font-medium'>
              Recent Chats
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <ScrollArea className='h-full'>
              {error && state === 'expanded' && (
                <div className='border-destructive/20 bg-destructive/10 mx-4 mb-4 rounded-lg border p-3'>
                  <p className='text-destructive text-sm'>{error}</p>
                </div>
              )}

              {conversations.length === 0 ? (
                <div className='flex flex-col items-center justify-center p-6 text-center'>
                  {state === 'expanded' ? (
                    <>
                      <div className='bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
                        <MessageCircle className='text-muted-foreground h-6 w-6' />
                      </div>
                      <h3 className='text-foreground mb-2 font-medium'>
                        No conversations yet
                      </h3>
                      <p className='text-muted-foreground mb-4 text-sm'>
                        Start a new chat to begin messaging
                      </p>
                      <Button size='sm' className='rounded-full'>
                        <Plus className='mr-2 h-4 w-4' />
                        Start Chat
                      </Button>
                    </>
                  ) : (
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 rounded-full p-0'
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              ) : (
                <SidebarMenu>
                  {conversations.map((conv) => {
                    const recipient = getRecipient(conv);
                    const lastMessage = conv.messages[0];
                    const isUnread =
                      lastMessage && lastMessage.senderId !== currentUserId;
                    const isActive = currentConversationId === conv.id;

                    return (
                      <SidebarMenuItem key={conv.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            'hover:bg-accent/50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground h-auto p-3',
                            state === 'collapsed' && 'justify-center',
                          )}
                        >
                          <Link href={`/chat/${conv.id}`}>
                            <div className='flex w-full min-w-0 items-center gap-3'>
                              <div className='relative flex-shrink-0'>
                                <Avatar className='border-background h-10 w-10 border-2 shadow-sm'>
                                  <AvatarImage
                                    src={recipient.image || undefined}
                                    alt={
                                      recipient.name ||
                                      recipient.username ||
                                      'User'
                                    }
                                  />
                                  <AvatarFallback>
                                    {getInitials(
                                      recipient.name ||
                                        recipient.username ||
                                        'U',
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                {getUserById(recipient.id)?.status ===
                                  'online' && (
                                  <div className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background' />
                                )}
                              </div>

                              {state === 'expanded' && (
                                <div className='min-w-0 flex-1'>
                                  <div className='mb-1 flex items-center justify-between'>
                                    <h3 className='text-foreground truncate font-medium'>
                                      {recipient.name ||
                                        recipient.username ||
                                        'Unknown User'}
                                    </h3>

                                    <div className='flex flex-shrink-0 items-center gap-2'>
                                      <span className='text-muted-foreground text-xs'>
                                        {formatTime(conv.lastMessageAt)}
                                      </span>
                                      {isUnread && (
                                        <Badge className='h-2 w-2 rounded-full bg-blue-500 p-0' />
                                      )}
                                    </div>
                                  </div>

                                  {lastMessage && (
                                    <p className='text-muted-foreground truncate text-sm'>
                                      {lastMessage.senderId ===
                                        currentUserId && (
                                        <span className='text-muted-foreground/70'>
                                          You:{' '}
                                        </span>
                                      )}
                                      {lastMessage.content}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(
                'hover:bg-accent/50 h-auto p-3',
                state === 'collapsed' && 'justify-center',
              )}
            >
              <Users className='h-5 w-5' />
              {state === 'expanded' && <span>Find People</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(
                'hover:bg-accent/50 h-auto p-3',
                state === 'collapsed' && 'justify-center',
              )}
            >
              <Settings className='h-5 w-5' />
              {state === 'expanded' && <span>Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
