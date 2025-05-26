import { format, isThisWeek, isToday, isYesterday } from 'date-fns';
import { MessageCircle, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  } catch (err) {
    console.error('Error fetching conversations:', err);
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

  return (
    <div className="bg-background flex h-screen">
      <div className="bg-card mx-auto w-full max-w-md border-r shadow-xl">
        {/* Header */}
        <div className="bg-card/80 sticky top-0 z-10 border-b backdrop-blur-sm">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-foreground text-2xl font-bold">Messages</h1>
              <Button size="sm" className="rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search conversations..."
                className="bg-muted/50 border-input focus:bg-background rounded-full pl-10"
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4">
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="p-4">
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
              <div className="bg-primary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <MessageCircle className="text-primary-foreground h-8 w-8" />
              </div>
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                No conversations yet
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Start a new chat to begin messaging
              </p>
              <Button className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conv) => {
                const recipient = getRecipient(conv);
                const lastMessage = conv.messages[0];
                const isUnread =
                  lastMessage && lastMessage.senderId !== currentUserId;

                return (
                  <Link key={conv.id} href={`/chat/${conv.id}`}>
                    <Card className="hover:bg-muted/50 group cursor-pointer border-0 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {/* Avatar with online status */}
                          <div className="relative">
                            <Avatar className="border-background h-12 w-12 border-2 shadow-sm">
                              <AvatarImage
                                src={recipient.image || undefined}
                                alt={
                                  recipient.name || recipient.username || 'User'
                                }
                              />
                              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                {(recipient.name || recipient.username || 'U')
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online indicator */}
                            <div className="border-background absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-2 bg-green-500" />
                          </div>

                          {/* Message content */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <h3 className="text-foreground truncate font-semibold">
                                {recipient.name ||
                                  recipient.username ||
                                  'Unknown User'}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-muted-foreground text-xs">
                                  {formatTime(conv.lastMessageAt)}
                                </span>
                                {isUnread && (
                                  <div className="bg-primary h-2 w-2 rounded-full" />
                                )}
                              </div>
                            </div>

                            {lastMessage && (
                              <p className="text-muted-foreground truncate text-sm">
                                {lastMessage.senderId === currentUserId && (
                                  <span className="text-muted-foreground/70">
                                    You:{' '}
                                  </span>
                                )}
                                {lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
