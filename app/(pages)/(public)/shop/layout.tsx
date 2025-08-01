import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <div className='container mx-auto mb-10 px-2 md:px-0'>{children}</div>
      <Footer />
    </>
  );
}
