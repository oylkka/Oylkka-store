import { createFileRoute } from '@tanstack/react-router';
import { MapIcon } from 'lucide-react';

export const Route = createFileRoute('/dashboard/vendor/shipping/tracking')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <MapIcon className='w-12 h-12 text-muted-foreground mb-4' />
      <h2 className='text-lg font-semibold'>Track Shipments</h2>
      <p className='text-sm text-muted-foreground mt-2 max-w-xs'>
        Shipment tracking will be available soon.
      </p>
    </div>
  );
}
