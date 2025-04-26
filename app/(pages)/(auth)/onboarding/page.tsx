'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import OnboardingForm from './onboarding-form';

export default function OnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Complete Your Profile
      </h1>
      <Suspense fallback={<OnboardingFormSkeleton />}>
        <OnboardingForm />
      </Suspense>
    </div>
  );
}

function OnboardingFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-center py-6">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
