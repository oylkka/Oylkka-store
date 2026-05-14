import { createFileRoute, redirect } from '@tanstack/react-router';

import { CategoryForm } from '@/components/forms/category-form';

export const Route = createFileRoute('/dashboard/admin/category/add')({
  beforeLoad: ({ context }) => {
    if (!context.user.role || context.user.role !== 'ADMIN') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryForm mode='create' />;
}
