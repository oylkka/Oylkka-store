import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AppSidebar } from '#/components/layout/dashboard/app-sidebar';
import BreadCrumb from '#/components/layout/dashboard/breadcrumb';
import Footer from '#/components/layout/footer';
import Header from '#/components/layout/header';
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar';
import { RouteErrorBoundary } from '@/components/error-boundary';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/signin' });
    }
    return { user: context.user };
  },
  errorComponent: RouteErrorBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <Header />
        <BreadCrumb />
        <div className='flex flex-1 flex-col gap-4 p-2 md:p-4'>
          <Outlet />
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
