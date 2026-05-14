import { createFileRoute } from '@tanstack/react-router';
import Footer from '#/components/layout/footer';
import Header from '#/components/layout/header';
import CategoryCarousel from '#/components/pages/home/category-carousel';
import HeroSection from '#/components/pages/home/hero';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <div>
      <Header />
      <div>
        <HeroSection />
        <CategoryCarousel />
      </div>
      <Footer />
    </div>
  );
}
