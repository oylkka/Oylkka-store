'use client';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { RefreshCcw, Save } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface FormActionsProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export default function FormActions({ form, isSubmitting }: FormActionsProps) {
  const isMobile = useIsMobile();

  return (
    <div className="animate-in fade-in flex flex-col justify-end gap-3 duration-500 sm:flex-row">
      <Button
        type="reset"
        variant="outline"
        onClick={() => form.reset()}
        disabled={isSubmitting}
        className="group transition-all duration-300"
      >
        <RefreshCcw className="mr-2 h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
        Reset Form
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="group relative overflow-hidden transition-all duration-300"
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            <span>{isMobile ? 'Complete' : 'Complete Onboarding'}</span>
            <div className="bg-primary-foreground/10 absolute inset-0 translate-y-[100%] transition-transform duration-300 group-hover:translate-y-[0%]" />
          </>
        )}
      </Button>
    </div>
  );
}
