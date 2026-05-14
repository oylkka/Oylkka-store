import { createFileRoute } from '@tanstack/react-router';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

export const Route = createFileRoute('/shop/category/$slug')({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();

  return (
    <div>
      <Header />
      <div className='container mx-auto px-2 md:px-4 py-20'>
        <h1 className='text-3xl font-bold'>Category: {slug}</h1>
        <p className='text-muted-foreground mt-2'>
          Products in this category will be displayed here.
        </p>
      </div>
      <Footer />
    </div>
  );
}
