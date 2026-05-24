import type { ErrorComponentProps } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';

export function RouteErrorBoundary({ error }: ErrorComponentProps) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 p-8'>
      <h1 className='text-2xl font-bold'>Something went wrong</h1>
      <p className='text-muted-foreground text-center max-w-md'>
        {error instanceof Error
          ? error.message
          : 'An unexpected error occurred'}
      </p>
      <div className='flex gap-2'>
        <Link
          to='/'
          className='text-primary underline-offset-4 hover:underline'
        >
          Go home
        </Link>
        <button
          type='button'
          onClick={() => window.location.reload()}
          className='text-primary underline-offset-4 hover:underline'
        >
          Retry
        </button>
      </div>
    </div>
  );
}
