import { createFileRoute, redirect } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { CategoryForm } from '@/components/forms/category-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategory } from '@/services/category';

export const Route = createFileRoute('/dashboard/admin/category/edit')({
  beforeLoad: ({ context }) => {
    if (!context.user.role || context.user.role !== 'ADMIN') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  validateSearch: (search: Record<string, string | undefined>) => ({
    categoryId: search.categoryId ?? '',
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { categoryId } = Route.useSearch();
  const { data: category, isLoading, isError } = useCategory(categoryId);

  if (!categoryId) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <p className='text-sm text-muted-foreground'>No category selected.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='max-w-4xl mx-auto container space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          <Skeleton className='h-80 rounded-2xl' />
          <Skeleton className='h-80 rounded-2xl' />
        </div>
        <Skeleton className='h-52 rounded-2xl' />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <div className='w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center'>
          <Loader2 className='w-6 h-6 text-destructive' />
        </div>
        <p className='text-sm font-semibold'>Category not found</p>
        <p className='text-sm text-muted-foreground max-w-xs'>
          The category you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <CategoryForm
      mode='edit'
      categoryId={categoryId}
      defaultValues={{
        name: category.name,
        description: category.description ?? '',
        parentId: category.parentId ?? undefined,
        featured: category.featured,
        order: category.order,
        image: undefined,
        hasExistingImage: !!category.imageUrl,
        keepExistingImage: true,
        existingImageUrl: category.imageUrl ?? undefined,
      }}
    />
  );
}
