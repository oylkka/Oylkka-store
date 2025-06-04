import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

import Categories from './categories';
import FeaturedProducts from './featured-products';
import HeroSection from './hero';
import RecentProducts from './recent-products';
import TypingApp from './typing-app';

export default function page() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <Categories />
        <FeaturedProducts />
        <RecentProducts />
        <TypingApp />
      </main>
      <Footer />
    </>
  );
}
