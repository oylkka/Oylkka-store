import { ShoppingBag } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ShopBasicInfo from './shop-basic-info';
import ShopBrandingSection from './shop-branding-info';
import ShopContactSection from './shop-contact-section';
import ShopPreview from './shop-preview-section';

export default function ShopInfoSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="text-primary" />
          Shop Information
        </CardTitle>
        <CardDescription>
          Create your shop profile to start selling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>
              <TabsContent value="basic">
                <ShopBasicInfo />
              </TabsContent>
              <TabsContent value="branding">
                <ShopBrandingSection />
              </TabsContent>
              <TabsContent value="contact">
                <ShopContactSection />
              </TabsContent>
            </Tabs>
          </div>
          <div className="hidden lg:block">
            <ShopPreview />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
