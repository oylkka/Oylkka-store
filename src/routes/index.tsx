import { createFileRoute } from '@tanstack/react-router';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import CategoryCarousel from '@/components/pages/home/category-carousel';
import DealsBanner from '@/components/pages/home/deals-banner';
import HeroSection from '@/components/pages/home/hero';
import NewArrivalsSection from '@/components/pages/home/new-arrivals';
import TrustStrip from '@/components/pages/home/trust-strip';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <TrustStrip />
        <CategoryCarousel />
        <NewArrivalsSection />
        <DealsBanner />
      </main>
      <Footer />
    </div>
  );
}
