import { createFileRoute, redirect } from '@tanstack/react-router';
import { MessageSquare } from 'lucide-react';

export const Route = createFileRoute('/dashboard/vendor/shop/messages')({
  beforeLoad: ({ context }) => {
    if (!context.user?.role || context.user.role !== 'VENDOR') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Messages</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Customer inquiries and conversations
        </p>
      </div>
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
          <MessageSquare className='w-7 h-7 text-muted-foreground' />
        </div>
        <div>
          <p className='text-sm font-semibold'>Coming Soon</p>
          <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
            Messaging system will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
