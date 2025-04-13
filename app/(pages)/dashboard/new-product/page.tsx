// pages/product/new.tsx
'use client';

import { ArrowBigLeft, Plus } from 'lucide-react';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';

import { BasicInformationCard } from './basic-information';
import { PriceAndStockCard } from './price-and-stock';
import { ProductFormContext } from './product-form-context';
import { ProductFormProvider } from './product-form-provider';
import { ProductFormValues } from './product-form-type';
import { ProductImagesCard } from './product-image';
import { SeoMetaCard } from './seo-meta';
import { ShippingDimensionsCard } from './shipping-and-dimension';
import { VariantsOptionsCard } from './variants-and-options';

export default function NewProductPage() {
  return (
    <div className="container mx-auto py-8">
      <ProductFormProvider>
        <NewProductForm />
      </ProductFormProvider>
    </div>
  );
}

function NewProductForm() {
  const methods = useFormContext<ProductFormValues>();
  const { onSubmit } = useContext(ProductFormContext);

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <ArrowBigLeft />
          </Button>
          <h1 className="text-2xl font-bold">New Product</h1>
        </div>
        <div className="flex items-center gap-5">
          <Button variant="outline" type="button">
            Discard
          </Button>
          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            Save Product
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="space-y-6 md:col-span-8">
          {/* Left Column Cards */}
          <BasicInformationCard />
          <PriceAndStockCard />
          <ShippingDimensionsCard />
          <VariantsOptionsCard />
        </div>
        <div className="space-y-6 md:col-span-4">
          {/* Right Column Cards */}
          <ProductImagesCard />
          <SeoMetaCard />
        </div>
      </div>
    </form>
  );
}
