import { format, isThisWeek, isToday, isYesterday } from 'date-fns';
import { ChevronLeft, MessageCircle, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

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

export default async function ChatIndexPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect('/api/auth/signin');
  }

  const currentUserId = session.user.id;

  let conversations: ConversationDisplay[] = [];
  let error: string | null = null;

  try {
    conversations = (await db.conversation.findMany({
      where: {
        OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      },
      include: {
        user1: {
          select: { id: true, name: true, username: true, image: true },
        },
        user2: {
          select: { id: true, name: true, username: true, image: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, senderId: true, content: true, createdAt: true },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    })) as ConversationDisplay[];
    // biome-ignore lint: error
  } catch (err) {
    error = 'Failed to fetch conversations. Please try again later.';
  }

  const getRecipient = (conv: ConversationDisplay) => {
    return conv.user1Id === currentUserId ? conv.user2 : conv.user1;
  };

  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
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
    <div className='container mx-auto flex h-full flex-col'>
      {/* Mobile Header */}
      <div className='border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur lg:hidden'>
        <div className='flex items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2'>
            <Link href='/'>
              <Button size='icon' variant='outline'>
                <ChevronLeft className='h-4 w-4' />
              </Button>
            </Link>

            <h1 className='text-foreground text-lg font-semibold'>Messages</h1>
          </div>
        </div>

        <div className='px-4 pb-3'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search conversations...'
              className='bg-muted/50 focus-visible:ring-ring h-9 border-0 pl-9 focus-visible:ring-1'
            />
          </div>
        </div>
      </div>

      {/* Desktop Welcome Message */}
      <div className='hidden h-full flex-col items-center justify-center lg:flex'>
        <div className='mx-auto max-w-md space-y-4 p-8 text-center'>
          <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'>
            <MessageCircle className='h-10 w-10 text-white' />
          </div>
          <div className='space-y-2'>
            <h2 className='text-foreground text-2xl font-bold'>
              Welcome to Chat
            </h2>
            <p className='text-muted-foreground'>
              Select a conversation from the sidebar to start messaging, or
              create a new chat to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Conversation List */}
      <div className='flex-1 overflow-hidden lg:hidden'>
        <ScrollArea className='h-full'>
          {error && (
            <div className='border-destructive/20 bg-destructive/10 mx-4 mb-4 rounded-lg border p-3'>
              <p className='text-destructive text-sm'>{error}</p>
            </div>
          )}

          {conversations.length === 0 ? (
            <div className='flex h-64 flex-col items-center justify-center p-6 text-center'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'>
                <MessageCircle className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-foreground mb-2 text-lg font-semibold'>
                No conversations yet
              </h3>
              <p className='text-muted-foreground mb-4 text-sm'>
                Start a new chat to begin messaging
              </p>
              <Button className='rounded-full'>
                <Plus className='mr-2 h-4 w-4' />
                Start New Chat
              </Button>
            </div>
          ) : (
            <div className='flex flex-col gap-6 p-2'>
              {conversations.map((conv) => {
                const recipient = getRecipient(conv);
                const lastMessage = conv.messages[0];
                const isUnread =
                  lastMessage && lastMessage.senderId !== currentUserId;

                return (
                  <Link key={conv.id} href={`/chat/${conv.id}`}>
                    <div className='flex items-center space-x-3'>
                      <div className='relative'>
                        <Avatar className='border-background h-12 w-12 border-2 shadow-sm'>
                          <AvatarImage
                            src={recipient.image || undefined}
                            alt={recipient.name || recipient.username || 'User'}
                          />
                          <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white'>
                            {getInitials(
                              recipient.name || recipient.username || 'U',
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='mb-1 flex items-center justify-between'>
                          <h3 className='text-foreground truncate font-semibold'>
                            {recipient.name ||
                              recipient.username ||
                              'Unknown User'}
                          </h3>
                          <div className='flex items-center space-x-2'>
                            <span className='text-muted-foreground text-xs'>
                              {formatTime(conv.lastMessageAt)}
                            </span>
                            {isUnread && (
                              <div className='h-2 w-2 rounded-full bg-blue-500' />
                            )}
                          </div>
                        </div>

                        {lastMessage && (
                          <p className='text-muted-foreground line-clamp-1 truncate text-sm'>
                            {lastMessage.senderId === currentUserId && (
                              <span className='text-muted-foreground/70'>
                                You:{' '}
                              </span>
                            )}
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
