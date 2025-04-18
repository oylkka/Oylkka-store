// pages/product/new.tsx
'use client';

import { ArrowBigLeft, Plus } from 'lucide-react';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { useCreateProduct } from '@/service';

import { BasicInformationCard } from './basic-information';
import { CategoryCard } from './category-and-tags';
import { PriceAndStockCard } from './price-and-stock';
import { ProductDetailsCard } from './product-conditions';
import { ProductFormContext } from './product-form-context';
import { ProductFormProvider } from './product-form-provider';
import { ProductFormValues } from './product-form-type';
import { ProductImagesCard } from './product-image';
import { ShippingDimensionsCard } from './shipping-and-dimension';
import { VariantAttributesCard } from './variants-and-options';

export default function NewProductPage() {
  return (
    <>
      <ProductFormProvider>
        <NewProductForm />
      </ProductFormProvider>
    </>
  );
}

function NewProductForm() {
  const methods = useFormContext<ProductFormValues>();
  const { onSubmit } = useContext(ProductFormContext);
  const { isPending } = useCreateProduct();

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
          <Button type="submit" className="gap-2" disabled={isPending}>
            {isPending ? (
              'Saving...'
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Save Product
              </>
            )}
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
          <VariantAttributesCard />
        </div>
        <div className="space-y-6 md:col-span-4">
          {/* Right Column Cards */}
          <ProductImagesCard />
          <CategoryCard />
          <ProductDetailsCard />
        </div>
      </div>
    </form>
  );
}
