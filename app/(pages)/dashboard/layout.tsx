import { AppSidebar } from '@/components/layout/dashboard/app-sidebar';
import BreadCrumb from '@/components/layout/dashboard/breadcrumb';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header navigation={false} />
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <BreadCrumb />
          </header>
          <div className="container mx-auto mb-10 px-2 md:px-4">{children}</div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
