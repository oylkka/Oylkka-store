import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

import Categories from './categories';
import HeroSection from './hero';

export default function page() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <Categories />
      </main>
      <Footer />
    </>
  );
}
