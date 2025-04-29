'use client';

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { checkSlugUniqueness, SlugCheckResult } from '@/actions';
import { OnboardingFormValues } from '@/schemas';

export function SlugUniquenessChecker() {
  const { control, setError, clearErrors } =
    useFormContext<OnboardingFormValues>();
  const shopSlug = useWatch({ control, name: 'shopSlug' });
  const [debouncedSlug] = useDebounce(shopSlug, 500);

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SlugCheckResult | null>(null);

  useEffect(() => {
    // Skip empty slugs
    if (!debouncedSlug || debouncedSlug.length < 3) {
      setResult(null);
      return;
    }

    // Check slug uniqueness
    const formData = new FormData();
    formData.append('shopSlug', debouncedSlug);

    startTransition(async () => {
      const checkResult = await checkSlugUniqueness(null, formData);
      setResult(checkResult);

      // Set or clear form error based on the result
      if (!checkResult.success || checkResult.isUnique === false) {
        setError('shopSlug', {
          type: 'manual',
          message: checkResult.message,
        });
      } else {
        clearErrors('shopSlug');
      }
    });
  }, [debouncedSlug, setError, clearErrors]);

  // Don't show anything if no slug or it's too short
  if (!shopSlug || shopSlug.length < 3) {
    return null;
  }

  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-sm">
      {isPending ? (
        <>
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">
            Checking availability...
          </span>
        </>
      ) : result?.isUnique ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-500">{result.message}</span>
        </>
      ) : result && !result.isUnique ? (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">{result.message}</span>
        </>
      ) : null}
    </div>
  );
}
