import {
  Globe,
  Info,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Metadata } from 'next';

import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy - oylkka',
  description:
    'Read our privacy policy to understand how your data is handled on oylkka.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen px-4 py-16 sm:px-8 md:px-16">
      <Card className="mx-auto max-w-4xl space-y-10 rounded-2xl p-8 shadow-xl">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            Effective Date: April 14, 2025
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Info className="text-primary" />
            <h2 className="text-2xl font-semibold">Overview</h2>
          </div>
          <p>
            At <strong>oylkka</strong>, your privacy is a top priority. This
            Privacy Policy outlines how we collect, use, and protect your
            information when you use our platform.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="text-primary" />
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
          </div>
          <p>
            We collect personal data such as your name, email address, shipping
            address, and payment information. We also gather usage information
            like device data, browser type, and pages visited.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <LockKeyhole className="text-primary" />
            <h2 className="text-2xl font-semibold">How We Use Your Data</h2>
          </div>
          <p>
            We use your data to fulfill orders, provide customer support, send
            updates, and improve our services. We may also send promotional
            emails and newsletters, which you can opt out of anytime.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-primary" />
            <h2 className="text-2xl font-semibold">Data Protection</h2>
          </div>
          <p>
            We implement industry-standard security measures like encryption and
            secure payment gateways. Your information is only accessible to
            authorized personnel and stored securely.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="text-primary" />
            <h2 className="text-2xl font-semibold">Third-Party Services</h2>
          </div>
          <p>
            We may share data with trusted partners to process payments or
            deliver orders. These partners comply with strict privacy standards
            and only use your data for agreed-upon services.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="text-primary" />
            <h2 className="text-2xl font-semibold">Contact Us</h2>
          </div>
          <p>
            Have questions or concerns? Email us at{' '}
            <a
              href="mailto:support@oylkka.com"
              className="text-primary underline"
            >
              support@oylkka.com
            </a>{' '}
            — we&#39;re happy to help!
          </p>
        </section>
      </Card>
    </div>
  );
}
