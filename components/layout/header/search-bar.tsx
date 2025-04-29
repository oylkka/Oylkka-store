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
}

export default function SearchBar({ isMobile = false }: SearchBarProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: '',
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    router.push(`/search?q=${encodeURIComponent(data.search)}`);
  };

  const clearInput = () => {
    form.setValue('search', '');
  };

  return (
    <div className="relative w-full">
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
                      className={`bg-muted focus-visible:ring-primary h-10 min-w-max rounded-full border-none pr-10 pl-10 ring-offset-0 focus-visible:ring-1 focus-visible:ring-offset-0 ${
                        isMobile ? 'h-9' : ''
                      }`}
                      autoComplete="off"
                    />
                    <Search
                      className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                      size={18}
                    />
                    {field.value?.length > 0 && (
                      <X
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                        size={18}
                        onClick={clearInput}
                      />
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
