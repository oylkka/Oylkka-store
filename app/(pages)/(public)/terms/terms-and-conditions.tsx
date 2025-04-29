'use client';

import {
  AlertTriangle,
  ChevronLeft,
  Copyright,
  Eye,
  FileTerminal,
  Globe,
  HandCoins,
  MessageSquare,
  Scale,
  ScrollText,
  Shield,
  ShoppingCart,
  UserCog,
} from 'lucide-react';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TermsAndConditions = () => {
  const [lastUpdated] = useState('April 29, 2025');

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="sm" className="mr-2">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Terms and Conditions</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center space-x-4">
            <ScrollText className="text-primary h-8 w-8" />
            <div>
              <h2 className="text-2xl font-semibold">Our Legal Agreement</h2>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>

          <p className="mb-4">
            Welcome to oylkka.com. These Terms and Conditions govern your use of
            our website located at www.oylkka.com (together or individually
            &#34;Service&#34;) operated by Oylkka Inc.
          </p>

          <p className="mb-4">
            By accessing or using the Service, you agree to be bound by these
            Terms. If you disagree with any part of the terms, then you may not
            access the Service.
          </p>

          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-800">
              Please read these Terms and Conditions carefully before using our
              Service. Your access to and use of the Service is conditioned on
              your acceptance of and compliance with these Terms.
            </AlertDescription>
          </Alert>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <ShoppingCart className="text-primary mb-2 h-8 w-8" />
                <h3 className="font-medium">Purchases</h3>
                <p className="text-muted-foreground text-sm">
                  Rules governing transactions on our platform
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <Shield className="text-primary mb-2 h-8 w-8" />
                <h3 className="font-medium">User Responsibilities</h3>
                <p className="text-muted-foreground text-sm">
                  Your obligations when using our services
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <Copyright className="text-primary mb-2 h-8 w-8" />
                <h3 className="font-medium">Intellectual Property</h3>
                <p className="text-muted-foreground text-sm">
                  Protection of our content and trademarks
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="standard" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard Terms</TabsTrigger>
          <TabsTrigger value="simplified">Simplified Explanation</TabsTrigger>
        </TabsList>

        <TabsContent value="standard">
          <ScrollArea className="h-96 rounded-md border p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <FileTerminal className="text-primary mr-2 h-5 w-5" />
                    <span>Acceptance of Terms</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      By accessing or using the Service, you confirm that you
                      have read, understood, and agree to be bound by these
                      Terms. If you are entering into these Terms on behalf of a
                      business or other legal entity, you represent that you
                      have the authority to bind such entity to these Terms.
                    </p>
                    <p className="mb-4">
                      We reserve the right to change or update these Terms at
                      any time. We will provide notice of significant changes by
                      posting the new Terms on the Site. Your continued use of
                      the Service after such modifications will constitute your
                      acknowledgment of the modified Terms and agreement to
                      abide and be bound by the modified Terms.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <UserCog className="text-primary mr-2 h-5 w-5" />
                    <span>User Accounts</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      When you create an account with us, you must provide
                      information that is accurate, complete, and current at all
                      times. Failure to do so constitutes a breach of the Terms,
                      which may result in immediate termination of your account
                      on our Service.
                    </p>
                    <p className="mb-4">
                      You are responsible for safeguarding the password that you
                      use to access the Service and for any activities or
                      actions under your password. You agree not to disclose
                      your password to any third party. You must notify us
                      immediately upon becoming aware of any breach of security
                      or unauthorized use of your account.
                    </p>
                    <p className="mb-4">
                      You may not use as a username the name of another person
                      or entity or that is not lawfully available for use, a
                      name or trademark that is subject to any rights of another
                      person or entity without appropriate authorization, or a
                      name that is offensive, vulgar, or obscene.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <ShoppingCart className="text-primary mr-2 h-5 w-5" />
                    <span>Purchases</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      Some features of the Service may allow you to purchase
                      goods or services. If you wish to purchase any product or
                      service made available through the Service
                      (&#34;Purchase&#34;), you may be asked to supply certain
                      information relevant to your Purchase including your
                      credit card number, the expiration date of your credit
                      card, your billing address, and your shipping information.
                    </p>
                    <p className="mb-4">
                      You represent and warrant that: (i) you have the legal
                      right to use any credit card(s) or other payment method(s)
                      in connection with any Purchase; and that (ii) the
                      information you supply to us is true, correct, and
                      complete.
                    </p>
                    <p className="mb-4">
                      The Service may employ third-party services for the
                      purpose of facilitating payment and completing Purchases.
                      By submitting your information, you grant us the right to
                      provide the information to these third parties subject to
                      our Privacy Policy.
                    </p>
                    <p className="mb-4">
                      We reserve the right to refuse or cancel your order at any
                      time for reasons including but not limited to: product or
                      service availability, errors in the description or price
                      of the product or service, error in your order, or other
                      reasons. We reserve the right to refuse or cancel your
                      order if fraud or an unauthorized or illegal transaction
                      is suspected.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <Scale className="text-primary mr-2 h-5 w-5" />
                    <span>Prohibited Uses</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      You agree to use the Service only for lawful purposes and
                      in accordance with the Terms. You agree not to use the
                      Service:
                    </p>
                    <ul className="mb-4 list-disc space-y-1 pl-5">
                      <li>
                        In any way that violates any applicable national or
                        international law or regulation.
                      </li>
                      <li>
                        For the purpose of exploiting, harming, or attempting to
                        exploit or harm minors in any way.
                      </li>
                      <li>
                        To transmit, or procure the sending of, any advertising
                        or promotional material, including any &#34;junk
                        mail&#34;, &#34;chain letter,&#34; &#34;spam,&#34; or
                        any other similar solicitation.
                      </li>
                      <li>
                        To impersonate or attempt to impersonate the Company, a
                        Company employee, another user, or any other person or
                        entity.
                      </li>
                      <li>
                        In any way that infringes upon the rights of others, or
                        in any way is illegal, threatening, fraudulent, or
                        harmful.
                      </li>
                      <li>
                        To engage in any other conduct that restricts or
                        inhibits anyone&#39;s use or enjoyment of the Service,
                        or which, as determined by us, may harm or offend the
                        Company or users of the Service or expose them to
                        liability.
                      </li>
                    </ul>
                    <p>Additionally, you agree not to:</p>
                    <ul className="mb-4 list-disc space-y-1 pl-5">
                      <li>
                        Use the Service in any manner that could disable,
                        overburden, damage, or impair the Service or interfere
                        with any other party&#39;s use of the Service.
                      </li>
                      <li>
                        Use any robot, spider, or other automatic device,
                        process, or means to access the Service for any purpose,
                        including monitoring or copying any of the material on
                        the Service.
                      </li>
                      <li>
                        Use any manual process to monitor or copy any of the
                        material on the Service or for any other unauthorized
                        purpose without our prior written consent.
                      </li>
                      <li>
                        Use any device, software, or routine that interferes
                        with the proper working of the Service.
                      </li>
                      <li>
                        Introduce any viruses, trojan horses, worms, logic
                        bombs, or other material which is malicious or
                        technologically harmful.
                      </li>
                      <li>
                        Attempt to gain unauthorized access to, interfere with,
                        damage, or disrupt any parts of the Service, the server
                        on which the Service is stored, or any server, computer,
                        or database connected to the Service.
                      </li>
                      <li>
                        Attack the Service via a denial-of-service attack or a
                        distributed denial-of-service attack.
                      </li>
                      <li>
                        Otherwise attempt to interfere with the proper working
                        of the Service.
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <Copyright className="text-primary mr-2 h-5 w-5" />
                    <span>Intellectual Property</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      The Service and its original content (excluding Content
                      provided by users), features, and functionality are and
                      will remain the exclusive property of Oylkka Inc. and its
                      licensors. The Service is protected by copyright,
                      trademark, and other laws of both the United States and
                      foreign countries. Our trademarks and trade dress may not
                      be used in connection with any product or service without
                      the prior written consent of Oylkka Inc.
                    </p>
                    <p className="mb-4">
                      Unless otherwise indicated, all materials, including
                      images, illustrations, designs, icons, photographs, video
                      clips, and written and other materials that appear as part
                      of the Service are copyrights, trademarks, service marks,
                      trade dress and/or other intellectual property owned,
                      controlled or licensed by Oylkka Inc.
                    </p>
                    <p>
                      The Service may contain user-generated content. You
                      understand that when using the Service, you will be
                      exposed to Content from a variety of sources, and that
                      Oylkka Inc. is not responsible for the accuracy,
                      usefulness, safety, or intellectual property rights of or
                      relating to such Content.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <HandCoins className="text-primary mr-2 h-5 w-5" />
                    <span>Payments and Refunds</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      We accept the following forms of payment:
                    </p>
                    <ul className="mb-4 list-disc space-y-1 pl-5">
                      <li>Visa</li>
                      <li>Mastercard</li>
                      <li>American Express</li>
                      <li>PayPal</li>
                    </ul>
                    <p className="mb-4">
                      You agree to provide current, complete, and accurate
                      purchase and account information for all purchases made
                      via the Service. You further agree to promptly update
                      account and payment information, including email address,
                      payment method, and payment card expiration date, so that
                      we can complete your transactions and contact you as
                      needed.
                    </p>
                    <p className="mb-4">
                      <span className="font-medium">Refund Policy:</span> We
                      issue refunds for Purchases within 30 days of the original
                      purchase date. To be eligible for a refund, your item must
                      be unused and in the same condition that you received it,
                      and you must have the receipt or proof of purchase.
                    </p>
                    <p>
                      <span className="font-medium">Cancellations:</span> You
                      can cancel an order only if it has not yet entered the
                      shipping process. Once an order has been shipped, it
                      cannot be cancelled, but you may return it according to
                      our Return Policy.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <MessageSquare className="text-primary mr-2 h-5 w-5" />
                    <span>User Content</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      Our Service allows you to post, link, store, share and
                      otherwise make available certain information, text,
                      graphics, videos, or other material (&#34;Content&#34;).
                      You are responsible for the Content that you post on or
                      through the Service, including its legality, reliability,
                      and appropriateness.
                    </p>
                    <p className="mb-4">
                      By posting Content on or through the Service, You
                      represent and warrant that:
                    </p>
                    <ul className="mb-4 list-disc space-y-1 pl-5">
                      <li>
                        The Content is yours (you own it) and/or you have the
                        right to use it and the right to grant us the rights and
                        license as provided in these Terms.
                      </li>
                      <li>
                        The posting of your Content on or through the Service
                        does not violate the privacy rights, publicity rights,
                        copyrights, contract rights or any other rights of any
                        person or entity.
                      </li>
                    </ul>
                    <p className="mb-4">
                      We reserve the right to terminate the account of anyone
                      found to be infringing on a copyright or other
                      intellectual property rights.
                    </p>
                    <p>
                      You retain any and all of your rights to any Content you
                      submit, post or display on or through the Service and you
                      are responsible for protecting those rights. We take no
                      responsibility and assume no liability for Content you or
                      any third party posts on or through the Service.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <AlertTriangle className="text-primary mr-2 h-5 w-5" />
                    <span>Limitation of Liability</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      To the maximum extent permitted by applicable law, in no
                      event shall Oylkka Inc., its affiliates, agents,
                      directors, employees, suppliers, or licensors be liable
                      for any indirect, punitive, incidental, special,
                      consequential or exemplary damages, including without
                      limitation damages for loss of profits, goodwill, use,
                      data or other intangible losses, arising out of or
                      relating to the use of, or inability to use, the Service.
                    </p>
                    <p className="mb-4">
                      To the maximum extent permitted by applicable law, Oylkka
                      Inc. assumes no liability or responsibility for:
                    </p>
                    <ul className="mb-4 list-disc space-y-1 pl-5">
                      <li>Any errors, mistakes, or inaccuracies of content.</li>
                      <li>
                        Any personal injury or property damage, of any nature
                        whatsoever, resulting from your access to or use of our
                        Service.
                      </li>
                      <li>
                        Any unauthorized access to or use of our secure servers
                        and/or any and all personal information stored therein.
                      </li>
                      <li>
                        Any interruption or cessation of transmission to or from
                        the Service.
                      </li>
                      <li>
                        Any bugs, viruses, trojan horses, or the like that may
                        be transmitted to or through the Service by any third
                        party.
                      </li>
                      <li>
                        Any errors or omissions in any content or for any loss
                        or damage incurred as a result of the use of any content
                        posted, transmitted, or otherwise made available through
                        the Service.
                      </li>
                    </ul>
                    <p>
                      In no event shall Oylkka Inc., its directors, employees,
                      partners, agents, suppliers, or affiliates, be liable for
                      any damages, direct or indirect, including lost profits,
                      data loss, cost of procurement of substitute goods or
                      services, or any other claims or damages.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <Globe className="text-primary mr-2 h-5 w-5" />
                    <span>Governing Law</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      These Terms shall be governed and construed in accordance
                      with the laws of [Your Country/State], without regard to
                      its conflict of law provisions.
                    </p>
                    <p className="mb-4">
                      Our failure to enforce any right or provision of these
                      Terms will not be considered a waiver of those rights. If
                      any provision of these Terms is held to be invalid or
                      unenforceable by a court, the remaining provisions of
                      these Terms will remain in effect.
                    </p>
                    <p>
                      These Terms constitute the entire agreement between us
                      regarding our Service, and supersede and replace any prior
                      agreements we might have had between us regarding the
                      Service.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <Eye className="text-primary mr-2 h-5 w-5" />
                    <span>Changes to Terms</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      We reserve the right, at our sole discretion, to modify or
                      replace these Terms at any time. If a revision is
                      material, we will provide at least 30 days&#39; notice
                      prior to any new terms taking effect. What constitutes a
                      material change will be determined at our sole discretion.
                    </p>
                    <p>
                      By continuing to access or use our Service after any
                      revisions become effective, you agree to be bound by the
                      revised terms. If you do not agree to the new terms, you
                      are no longer authorized to use the Service.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <MessageSquare className="text-primary mr-2 h-5 w-5" />
                    <span>Contact Us</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-7">
                    <p className="mb-4">
                      If you have any questions about these Terms, please
                      contact us:
                    </p>
                    <ul className="mb-4 list-none space-y-2">
                      <li>
                        <span className="font-medium">By email:</span>{' '}
                        <a
                          href="mailto:legal@oylkka.com"
                          className="text-primary hover:underline"
                        >
                          legal@oylkka.com
                        </a>
                      </li>
                      <li>
                        <span className="font-medium">By phone:</span> [Your
                        Phone Number]
                      </li>
                      <li>
                        <span className="font-medium">By mail:</span> [Your
                        Physical Address]
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="simplified">
          <ScrollArea className="h-96 rounded-md border p-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-medium">
                  <FileTerminal className="text-primary mr-2 h-5 w-5" />
                  What is This Document?
                </h3>
                <p className="text-muted-foreground pl-7">
                  This is our legal agreement. By using our website, you&#39;re
                  agreeing to follow these rules. We might update these terms
                  occasionally, and if we do, we&#39;ll let you know.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-medium">
                  <UserCog className="text-primary mr-2 h-5 w-5" />
                  Your Account
                </h3>
                <p className="text-muted-foreground pl-7">
                  When you create an account, you need to provide accurate
                  information. Keep your password safe and don&#39;t share it
                  with others. You&#39;re responsible for everything that
                  happens under your account.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-medium">
                  <ShoppingCart className="text-primary mr-2 h-5 w-5" />
                  Buying Products
                </h3>
                <p className="text-muted-foreground pl-7">
                  When you buy something, you need to provide accurate payment
                  information. We might use third-party services to process
                  payments. We can refuse or cancel orders if something seems
                  wrong.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-medium">
                  <Scale className="text-primary mr-2 h-5 w-5" />
                  What You Can&#39;t Do
                </h3>
                <p className="text-muted-foreground pl-7">
                  Don&#39;t use our site for anything illegal. Don&#39;t try to
                  harm others, especially children. Don&#39;t spam, impersonate
                  others, or try to break our website. Don&#39;t upload viruses
                  or harmful content.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-medium">
                  <Copyright className="text-primary mr-2 h-5 w-5" />
                  Who Owns the Content
                </h3>
                <p className="text-muted-foreground pl-7">
                  We own our website, logo, and content. You can&#39;t use our
                  branding without permission. If you upload content, you&#39;re
                  responsible for making sure you have the right to share it.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-medium">
                  <HandCoins className="text-primary mr-2 h-5 w-5" />
                  Money Matters
                </h3>
                <p className="text-muted-foreground pl-7">
                  We accept major credit cards and PayPal. If you want a refund,
                  you can request one within 30 days if the item is unused. You
                  can only cancel an order before it ships.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-medium">
                  <AlertTriangle className="text-primary mr-2 h-5 w-5" />
                  If Something Goes Wrong
                </h3>
                <p className="text-muted-foreground pl-7">
                  We do our best to provide a good service, but we can&#39;t be
                  held responsible for everything. If something goes wrong (like
                  website errors, data loss, or viruses), we have limits on our
                  liability.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-medium">
                  <MessageSquare className="text-primary mr-2 h-5 w-5" />
                  Questions?
                </h3>
                <p className="text-muted-foreground pl-7">
                  If you have questions about these terms, please contact us by
                  email, phone, or mail. We&#39;re happy to help clarify
                  anything that&#39;s unclear.
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Separator className="mb-8" />

      <div className="text-center">
        <p className="text-muted-foreground mb-2 text-sm">
          Last updated: {lastUpdated}
        </p>
        <Button variant="outline" size="lg" className="mt-4">
          I Accept the Terms and Conditions
        </Button>
      </div>
    </div>
  );
};

export default TermsAndConditions;
