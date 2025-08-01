'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConnectionStatusProps {
  connectionError: string | null;
  connectionState: string;
}

export function ConnectionStatus({ connectionError }: ConnectionStatusProps) {
  if (!connectionError) {
    return null;
  }

  return (
    <div className='mx-4 mt-2'>
      <Card className='border-destructive/50 bg-destructive/10'>
        <CardContent className='flex items-center justify-between p-3'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='text-destructive h-4 w-4' />
            <span className='text-destructive text-sm'>{connectionError}</span>
          </div>
          <Button size='sm' variant='outline'>
            <RefreshCw className='mr-1 h-3 w-3' />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
