import { createFileRoute } from '@tanstack/react-router';
import { Calendar } from 'lucide-react';

export const Route = createFileRoute('/dashboard/vendor/payouts/schedule')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <Calendar className='w-12 h-12 text-muted-foreground mb-4' />
      <h2 className='text-lg font-semibold'>Payout Schedule</h2>
      <p className='text-sm text-muted-foreground mt-2 max-w-xs'>
        Payout schedules and estimated payment dates will be available soon.
      </p>
    </div>
  );
}
