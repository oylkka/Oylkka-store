'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const FormSchema = z.object({
  search: z.string().min(2, {
    message: 'Search must be at least 2 characters.',
  }),
});

interface SearchBarProps {
  isMobile?: boolean;
  isHidden?: boolean;
}

export default function SearchBar({
  isMobile = false,
  isHidden = false,
}: SearchBarProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: '',
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    router.push(`/products?search=${encodeURIComponent(data.search)}`);
  };

  const clearInput = () => {
    form.setValue('search', '');
  };

  return (
    <div className={isHidden ? 'hidden' : 'relative w-full'}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative flex w-full">
                    <Input
                      {...field}
                      placeholder="Search products..."
                      className={`border-border/50 bg-background focus-visible:border-primary/50 focus-visible:ring-primary/30 h-10 rounded-full pr-10 pl-10 shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-offset-0 md:min-w-max ${isMobile ? 'h-9 w-full' : ''}`}
                      autoComplete="off"
                    />
                    <Search
                      className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-3 -translate-y-1/2 transition-colors"
                      size={18}
                    />
                    {field.value?.length > 0 && (
                      <button
                        type="button"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 transition-colors"
                        onClick={clearInput}
                      >
                        <X size={16} />
                        <span className="sr-only">Clear search</span>
                      </button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

// Export the icon component for reuse
SearchBar.Icon = function SearchIcon() {
  return <Search className="h-5 w-5" />;
};
