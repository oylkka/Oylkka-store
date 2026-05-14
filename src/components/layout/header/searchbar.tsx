import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  search: z.string().min(2, {
    message: 'Search must be at least 2 characters.',
  }),
});

interface SearchBarProps {
  className?: string;
  onSearchSubmit?: () => void;
}

export default function SearchBar({
  className,
  onSearchSubmit,
}: SearchBarProps) {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { search: '' },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    navigate({
      to: '/products',
      search: { search: encodeURIComponent(data.search) },
    });
    onSearchSubmit?.();
  };

  return (
    <div className='relative w-full'>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
        <Controller
          name='search'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className='relative flex w-full'>
                <Input
                  {...field}
                  id={field.name}
                  placeholder='Search products...'
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    'border-border/50 bg-background focus-visible:border-primary/50 focus-visible:ring-primary/30 h-10 rounded-full pr-10 pl-10 shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-offset-0 md:min-w-max',
                    className,
                  )}
                  autoComplete='off'
                />
                <Search
                  className='text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-3 -translate-y-1/2 transition-colors'
                  size={18}
                />
                {field.value?.length > 0 && (
                  <button
                    type='button'
                    className='text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 transition-colors'
                    onClick={() => form.setValue('search', '')}
                  >
                    <X size={16} />
                    <span className='sr-only'>Clear search</span>
                  </button>
                )}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </form>
    </div>
  );
}

SearchBar.Icon = function SearchIcon() {
  return <Search className='h-5 w-5' />;
};
