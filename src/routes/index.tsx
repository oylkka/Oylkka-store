import { createFileRoute } from '@tanstack/react-router';
import Footer from '#/components/layout/footer';
import Header from '#/components/layout/header';
import HeroSection from '#/components/pages/home/hero';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <div>
      <Header />
      <div>
        <HeroSection />
        <h1 className='text-4xl font-bold bg-primary'>
          Welcome to TanStack Start
        </h1>
        <p className='mt-4 text-lg'>
          Edit <code>src/routes/index.tsx</code> to get started.
        </p>
      </div>
      <Footer />
    </div>
  );
}
