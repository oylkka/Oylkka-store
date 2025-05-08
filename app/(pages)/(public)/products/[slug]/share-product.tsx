'use client';

import { Check, Copy, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function ShareProduct({ slug }: { slug: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const productLink = `${siteUrl}/products/${slug}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(productLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share This Product</DialogTitle>
          <DialogDescription>
            Share this product on your favorite platform or copy the link.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>
          <TabsContent value="link">
            <div className="flex flex-col space-y-2 py-4">
              <Textarea
                value={productLink}
                readOnly
                className="min-h-[80px] resize-none"
              />
              <Button onClick={handleCopy} className="w-full">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copy Link
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="qr">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="rounded-lg bg-white p-4">
                <QRCodeSVG value={productLink} size={200} />
              </div>
              <Button onClick={handleCopy} className="mt-4">
                <Copy className="mr-2 h-4 w-4" /> Copy Link
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
