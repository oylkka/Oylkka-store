import { redirect } from 'next/navigation';
import type React from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

import { ChatSidebar } from './chat-sidebar';

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

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="bg-background flex h-screen w-full">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <ChatSidebar
            conversations={conversations}
            currentUserId={currentUserId}
            error={error}
          />
        </div>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 lg:flex-1">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
