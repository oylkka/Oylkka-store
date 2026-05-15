import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/vendor')({
  beforeLoad: ({ context }) => {
    if (!context.user?.role || context.user.role !== 'VENDOR') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
