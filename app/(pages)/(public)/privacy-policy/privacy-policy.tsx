'use client';

import {
  Baby,
  ChevronLeft,
  Clock,
  Cookie,
  ExternalLink,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  UserCog,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy = () => {
  const [lastUpdated] = useState('April 29, 2025');

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="sm" className="mr-2">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center space-x-4">
            <Shield className="text-primary h-8 w-8" />
            <div>
              <h2 className="text-2xl font-semibold">
                Our Commitment to Privacy
              </h2>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>

          <p className="mb-4">
            Welcome to oylkka.com (the &#34;Site&#34;) operated by Oylkka Inc.
            We respect your privacy and are committed to protecting your
            personal information. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you visit our
            website.
          </p>

          <p className="mb-4">
            Please read this Privacy Policy carefully. By accessing or using our
            Site, you acknowledge that you have read, understood, and agree to
            be bound by all the terms outlined in this Privacy Policy. If you do
            not agree with the terms of this Privacy Policy, please do not
            access the Site.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <Shield className="text-primary mb-2 h-8 w-8" />
                <h3 className="font-medium">Data Protection</h3>
                <p className="text-muted-foreground text-sm">
                  Your data is handled with care and protected
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <UserCog className="text-primary mb-2 h-8 w-8" />
                <h3 className="font-medium">Your Control</h3>
                <p className="text-muted-foreground text-sm">
                  Manage your data preferences anytime
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <Lock className="text-primary mb-2 h-8 w-8" />
                <h3 className="font-medium">Secure Practices</h3>
                <p className="text-muted-foreground text-sm">
                  Industry-standard security measures
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="mb-8 h-96 rounded-md border p-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <Users className="text-primary mr-2 h-5 w-5" />
                <span>Information We Collect</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <h4 className="mb-2 font-semibold">Personal Data</h4>
                <p className="mb-4">
                  We may collect personal information that you voluntarily
                  provide to us when you:
                </p>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>Create an account</li>
                  <li>Place an order</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Contact our customer support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>

                <p className="mb-4">
                  The personal information we may collect includes:
                </p>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Billing address</li>
                  <li>Shipping address</li>
                  <li>Payment information</li>
                  <li>Profile picture</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h4 className="mb-2 font-semibold">
                  Automatically Collected Data
                </h4>
                <p className="mb-4">
                  When you visit the Site, we automatically collect certain
                  information about your device, including:
                </p>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Device information</li>
                  <li>Time zone setting and location</li>
                  <li>Pages you view</li>
                  <li>Time spent on pages</li>
                  <li>Referring website address</li>
                  <li>Click patterns</li>
                </ul>
                <p>
                  We may also collect information about how you use the Site
                  through cookies, web beacons, and similar technologies.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <UserCog className="text-primary mr-2 h-5 w-5" />
                <span>How We Use Your Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p className="mb-4">
                  We use the information we collect for various purposes,
                  including to:
                </p>

                <h4 className="mb-2 font-semibold">If You Are a Customer:</h4>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>Process and fulfill your orders</li>
                  <li>Provide customer support</li>
                  <li>Administer your account</li>
                  <li>Send transactional emails and order updates</li>
                  <li>Improve the layout and content of our Site</li>
                  <li>Personalize your experience</li>
                  <li>Respond to your queries and feedback</li>
                  <li>Display your profile information (if applicable)</li>
                  <li>Process payments</li>
                  <li>Conduct analytics and research</li>
                  <li>
                    Send marketing communications (if you&#39;ve opted in)
                  </li>
                  <li>Prevent fraud and improve security</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h4 className="mb-2 font-semibold">
                  If You Are a Seller or Business Partner:
                </h4>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>Facilitate your use of our platform</li>
                  <li>Process payments</li>
                  <li>Respond to your queries</li>
                  <li>Administer your account</li>
                  <li>Verify your information</li>
                  <li>Provide business analytics</li>
                  <li>Send relevant business communications</li>
                  <li>Comply with legal requirements</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <Cookie className="text-primary mr-2 h-5 w-5" />
                <span>Cookies and Tracking Technologies</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p className="mb-4">
                  We use cookies and similar tracking technologies to track
                  activity on our Site and hold certain information. Cookies are
                  files with a small amount of data that may include an
                  anonymous unique identifier. They are sent to your browser
                  from a website and stored on your device.
                </p>

                <p className="mb-4">
                  You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent. However, if you do not
                  accept cookies, you may not be able to use some portions of
                  our Site.
                </p>

                <p className="mb-4">Types of cookies we use:</p>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>
                    <span className="font-medium">Essential cookies:</span>{' '}
                    Required for the operation of our Site
                  </li>
                  <li>
                    <span className="font-medium">
                      Analytical/performance cookies:
                    </span>{' '}
                    Allow us to recognize and count visitors and see how they
                    move around our Site
                  </li>
                  <li>
                    <span className="font-medium">Functionality cookies:</span>{' '}
                    Enable us to personalize content for you
                  </li>
                  <li>
                    <span className="font-medium">Targeting cookies:</span>{' '}
                    Record your visit to our Site, the pages you visit, and the
                    links you follow
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <Lock className="text-primary mr-2 h-5 w-5" />
                <span>Data Security</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p className="mb-4">
                  We have implemented appropriate technical and organizational
                  security measures designed to protect the security of any
                  personal information we process. However, please also remember
                  that we cannot guarantee that the internet itself is 100%
                  secure. Although we will do our best to protect your personal
                  information, transmission of personal information to and from
                  our Site is at your own risk.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <Clock className="text-primary mr-2 h-5 w-5" />
                <span>Data Retention</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p className="mb-4">
                  We will only retain your personal information for as long as
                  necessary to fulfill the purposes for which we collected it,
                  including for the purposes of satisfying any legal,
                  accounting, or reporting requirements.
                </p>

                <p className="mb-4">
                  To determine the appropriate retention period for personal
                  data, we consider:
                </p>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>
                    The amount, nature, and sensitivity of the personal data
                  </li>
                  <li>
                    The potential risk of harm from unauthorized use or
                    disclosure
                  </li>
                  <li>The purposes for which we process your personal data</li>
                  <li>
                    Whether we can achieve those purposes through other means
                  </li>
                  <li>The applicable legal requirements</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <UserCog className="text-primary mr-2 h-5 w-5" />
                <span>Your Data Protection Rights</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p className="mb-4">
                  Depending on your location, you may have the following rights
                  regarding your personal information:
                </p>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>
                    <span className="font-medium">Right to access:</span>{' '}
                    Request a copy of the personal information we hold about you
                  </li>
                  <li>
                    <span className="font-medium">Right to rectification:</span>{' '}
                    Request correction of any inaccurate personal information
                  </li>
                  <li>
                    <span className="font-medium">Right to erasure:</span>{' '}
                    Request deletion of your personal information
                  </li>
                  <li>
                    <span className="font-medium">
                      Right to restrict processing:
                    </span>{' '}
                    Request restriction of processing of your personal
                    information
                  </li>
                  <li>
                    <span className="font-medium">
                      Right to data portability:
                    </span>{' '}
                    Request transfer of your personal information
                  </li>
                  <li>
                    <span className="font-medium">Right to object:</span> Object
                    to processing of your personal information
                  </li>
                  <li>
                    <span className="font-medium">
                      Right to withdraw consent:
                    </span>{' '}
                    Withdraw consent where we rely on consent to process your
                    information
                  </li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the
                  contact information provided below.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <Users className="text-primary mr-2 h-5 w-5" />
                <span>Third-Party Disclosure</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p className="mb-4">
                  We may share your personal information with:
                </p>
                <ul className="mb-4 list-disc space-y-1 pl-5">
                  <li>
                    <span className="font-medium">Service providers:</span>{' '}
                    Companies that assist us in operating our website,
                    conducting our business, or servicing you
                  </li>
                  <li>
                    <span className="font-medium">Business partners:</span>{' '}
                    Trusted third parties with whom we collaborate
                  </li>
                  <li>
                    <span className="font-medium">Affiliates:</span> Companies
                    related to us by common ownership or control
                  </li>
                  <li>
                    <span className="font-medium">Legal requirements:</span>{' '}
                    When required by law or to protect our rights
                  </li>
                </ul>
                <p>
                  We do not sell, trade, or otherwise transfer your personal
                  information to outside parties without your consent, except as
                  described in this Privacy Policy.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <ExternalLink className="text-primary mr-2 h-5 w-5" />
                <span>Third-Party Links</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p>
                  Our Site may contain links to third-party websites. We have no
                  control over and assume no responsibility for the content,
                  privacy policies, or practices of any third-party sites or
                  services. We encourage you to read the privacy policy of every
                  website you visit.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <Baby className="text-primary mr-2 h-5 w-5" />
                <span>Children&#39;s Privacy</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p>
                  Our Site is not intended for children under 18 years of age.
                  We do not knowingly collect personal information from children
                  under 18. If you are a parent or guardian and believe your
                  child has provided us with personal information, please
                  contact us. If we discover we have collected personal
                  information from a child under 18, we will delete such
                  information from our servers immediately.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <RefreshCw className="text-primary mr-2 h-5 w-5" />
                <span>Changes to This Privacy Policy</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p>
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the &#34;Last Updated&#34; date. You
                  are advised to review this Privacy Policy periodically for any
                  changes.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-11">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center">
                <Mail className="text-primary mr-2 h-5 w-5" />
                <span>Contact Us</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-7">
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, please
                  contact us:
                </p>
                <ul className="mb-4 list-none space-y-2">
                  <li>
                    <span className="font-medium">By email:</span>{' '}
                    <a
                      href="mailto:privacy@oylkka.com"
                      className="text-primary hover:underline"
                    >
                      privacy@oylkka.com
                    </a>
                  </li>
                  <li>
                    <span className="font-medium">By phone:</span> [Your Phone
                    Number]
                  </li>
                  <li>
                    <span className="font-medium">By mail:</span> [Your Physical
                    Address]
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>

      <Separator className="mb-8" />

      <div className="text-center">
        <p className="text-muted-foreground mb-2 text-sm">
          Last updated: {lastUpdated}
        </p>
        <Button variant="outline" size="lg" className="mt-4">
          I Accept the Privacy Policy
        </Button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
