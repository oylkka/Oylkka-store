import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

import PrivacyPolicy from './privacy-policy';

export const metadata = {
  title: 'Privacy Policy | Oylkka',
  description:
    'Learn about how we collect, use, and protect your personal information at Oylkka.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <PrivacyPolicy />
      <Footer />
    </>
  );
}
