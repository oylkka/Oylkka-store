import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

import TermsAndConditions from './terms-and-conditions';

export const metadata = {
  title: 'Terms and Conditions | Oylkka',
  description:
    "Learn about the rules and agreements governing the use of Oylkka's services.",
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <Header />
      <TermsAndConditions />
      <Footer />
    </>
  );
}
