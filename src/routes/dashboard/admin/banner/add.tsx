import { createFileRoute, redirect } from '@tanstack/react-router';

import { BannerForm } from '@/components/forms/banner-form';

export const Route = createFileRoute('/dashboard/admin/banner/add')({
  beforeLoad: ({ context }) => {
    if (!context.user.role || context.user.role !== 'ADMIN') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <BannerForm mode='create' />;
}
