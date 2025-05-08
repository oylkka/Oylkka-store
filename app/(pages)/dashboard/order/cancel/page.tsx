'use client';

import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CancelPageWrapper() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading...</div>}>
      <CancelPage />
    </Suspense>
  );
}

function CancelPage() {
  const searchParams = useSearchParams();
  const [reason, setReason] = useState<string>('');
  const currentDate = format(new Date(), 'MMMM d, yyyy');

  useEffect(() => {
    const reasonParam = searchParams.get('reason');
    setReason(reasonParam ? decodeURIComponent(reasonParam) : 'Unknown error');
  }, [searchParams]);
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <Card className="border-destructive/20">
        <CardHeader className="space-y-1">
          <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive h-6 w-6" />
          </div>
          <CardTitle className="text-center text-2xl">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-center">
            Your payment was not processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{reason}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Order Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Date</div>
              <div className="text-right">{currentDate}</div>
              <div className="text-muted-foreground">Status</div>
              <div className="text-destructive text-right">Failed</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">What happens next?</h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Your payment was not processed</li>
              <li>• No funds have been deducted from your account</li>
              <li>• You can try again with a different payment method</li>
              <li>• Contact support if you need assistance</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            className="w-full"
            variant="default"
            onClick={() => router.push('/cart/checkout')}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Payment Again
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
