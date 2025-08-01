import { ShoppingBag } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import ShopBasicInfo from './shop-basic-info';
import ShopBrandingSection from './shop-branding-info';
import ShopContactSection from './shop-contact-section';
import ShopPreview from './shop-preview-section';

export default function ShopInfoSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ShoppingBag className='text-primary' />
          Shop Information
        </CardTitle>
        <CardDescription>
          Create your shop profile to start selling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='space-y-8 lg:col-span-2'>
            {/* Basic Info Section */}
            <div>
              <h3 className='mb-4 text-lg font-medium'>Basic Information</h3>
              <ShopBasicInfo />
            </div>

            <Separator />

            {/* Branding Section */}
            <div>
              <h3 className='mb-4 text-lg font-medium'>Shop Branding</h3>
              <ShopBrandingSection />
            </div>

            <Separator />

            {/* Contact Section */}
            <div>
              <h3 className='mb-4 text-lg font-medium'>
                Contact & Social Media
              </h3>
              <ShopContactSection />
            </div>
          </div>

          <div className='hidden lg:block'>
            <ShopPreview />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
