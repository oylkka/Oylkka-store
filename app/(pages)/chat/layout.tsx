import { redirect } from 'next/navigation';
import type React from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/features/auth/auth';

import { ChatSidebar } from './chat-sidebar';

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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='bg-background flex h-screen w-full'>
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className='hidden lg:block'>
          <ChatSidebar currentUserId={currentUserId} />
        </div>

        {/* Main Content Area */}
        <SidebarInset className='flex-1 lg:flex-1'>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
