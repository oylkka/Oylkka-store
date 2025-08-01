import { Skeleton } from '@/components/ui/skeleton';

export default function ShopSkeleton() {
  return (
    <div className='min-h-screen pb-12'>
      <div className='relative h-64 w-full sm:h-80 md:h-96' />

      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='relative -mt-24 flex flex-col sm:flex-row sm:items-end sm:space-x-5'>
          <Skeleton className='h-32 w-32 rounded-xl border-4 sm:h-40 sm:w-40' />
          <div className='mt-6 sm:mt-0 sm:flex-1'>
            <Skeleton className='h-10 w-48' />
            <Skeleton className='mt-2 h-4 w-32' />
          </div>
          <div className='mt-6 flex flex-col space-y-3 sm:mt-0 sm:flex-row sm:space-y-0 sm:space-x-3'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-32' />
          </div>
        </div>

        <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-12'>
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint: error
            <Skeleton key={i} className='h-32 rounded-lg' />
          ))}
        </div>

        <div className='mt-8 space-y-8'>
          <Skeleton className='h-[400px] w-full rounded-lg' />
          <Skeleton className='h-[300px] w-full rounded-lg' />
          <Skeleton className='h-[250px] w-full rounded-lg' />
        </div>
      </div>
    </div>
  );
}
