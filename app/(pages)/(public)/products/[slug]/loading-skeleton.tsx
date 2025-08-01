import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSkeleton() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
        <div className='space-y-4'>
          <Skeleton className='h-[500px] w-full rounded-lg' />
          <div className='flex gap-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className='h-24 w-24 rounded-md' />
            ))}
          </div>
        </div>
        <div className='space-y-6'>
          <div>
            <Skeleton className='h-6 w-20 rounded-full' />
            <Skeleton className='mt-2 h-10 w-3/4' />
            <div className='mt-2 flex items-center gap-4'>
              <Skeleton className='h-5 w-32' />
            </div>
          </div>
          <div className='space-y-1'>
            <Skeleton className='h-8 w-32' />
            <Skeleton className='h-4 w-40' />
          </div>
          <Skeleton className='h-24 w-full' />
          <div className='space-y-6'>
            <div>
              <Skeleton className='mb-2 h-5 w-16' />
              <div className='flex gap-3'>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className='h-10 w-10 rounded-full' />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className='mb-2 h-5 w-16' />
              <div className='flex gap-3'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-10 w-14 rounded-md' />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className='mb-2 h-5 w-20' />
              <div className='flex items-center'>
                <Skeleton className='h-10 w-10' />
                <Skeleton className='mx-4 h-6 w-12' />
                <Skeleton className='h-10 w-10' />
              </div>
            </div>
            <div className='flex gap-4 pt-4'>
              <Skeleton className='h-14 w-full' />
              <Skeleton className='h-14 w-14' />
            </div>
          </div>
          <Skeleton className='h-40 w-full rounded-xl' />
        </div>
      </div>
      <Skeleton className='mt-16 h-12 w-full' />
      <Skeleton className='mt-6 h-64 w-full' />
    </div>
  );
}
