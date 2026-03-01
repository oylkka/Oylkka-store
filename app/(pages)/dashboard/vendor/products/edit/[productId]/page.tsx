'use client';

import { ArrowBigLeft, Plus } from 'lucide-react';
import { use, useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductImage } from '@/hooks/use-product-image';
import { useProductById } from '@/services';

import { BasicInformationCard } from '../../add/basic-information';
import PricingAndInventory from '../../add/pricing-and-inventory';
import { ProductCondition } from '../../add/product-condition';
import { ProductDimensions } from '../../add/product-dimension';
import { ProductFormContext } from '../../add/product-form-context';
import { ProductFormProvider } from '../../add/product-form-provider';
import type {
  ProductFormInput,
  ProductFormValues,
} from '../../add/product-form-type';
import { ProductImagesCard } from '../../add/product-image';
import ProductSeo from '../../add/product-seo';
import ProductStatus from '../../add/product-status';
import ProductVariant from '../../add/product-variant';

interface ProductFromAPI {
  id: string;
  productName: string;
  slug: string;
  description: string;
  categoryId: string;
  tags: string[];
  sku: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  stock: number;
  lowStockAlert?: number;
  brand: string | null;
  condition: string;
  conditionDescription: string | null;
  weight: number | null;
  weightUnit: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  } | null;
  freeShipping: boolean;
  images: { url: string; publicId: string; alt: string | null }[];
  attributes: Record<string, unknown> | null;
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    discountPrice: number | null;
    stock: number;
    attributes: Record<string, string>;
    image: string | null;
  }[];
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  featured: boolean;
  category: { slug: string; id: string } | null;
}

function transformProductToFormData(product: ProductFromAPI): ProductFormInput {
  return {
    productName: product.productName,
    description: product.description,
    slug: product.slug,
    category: product.category?.slug ?? '',
    tags: product.tags || [],
    sku: product.sku,
    price: product.price,
    discountPrice: product.discountPrice ?? 0,
    discountPercent: product.discountPercent ?? 0,
    stock: product.stock,
    lowStockAlert: product.lowStockAlert ?? 5,
    brand: product.brand ?? '',
    condition: product.condition as ProductFormInput['condition'],
    conditionDescription: product.conditionDescription ?? '',
    weight: product.weight ?? 0,
    weightUnit: product.weightUnit,
    dimensions: product.dimensions ?? undefined,
    freeShipping: product.freeShipping,
    attributes:
      (product.attributes as ProductFormInput['attributes']) ?? undefined,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      discountPrice: v.discountPrice ?? 0,
      stock: v.stock,
      attributes: v.attributes,
      image: v.image,
    })),
    metaTitle: product.metaTitle ?? '',
    metaDescription: product.metaDescription ?? '',
    status: product.status as ProductFormInput['status'],
    featured: product.featured,
  };
}

function transformProductToImages(product: ProductFromAPI): ProductImage[] {
  return product.images.map((img, index) => ({
    id: img.publicId || `existing_${index}`,
    file: null,
    preview: img.url,
    alt: img.alt,
  }));
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);

  const {
    data: product,
    isLoading,
    isError,
  } = useProductById({
    productId: productId,
  });

  if (isLoading) {
    return <Skeleton className='h-[500px] w-full' />;
  }

  if (isError || !product) {
    return <div>Error loading product data.</div>;
  }

  const formData = transformProductToFormData(product);
  const initialImages = transformProductToImages(product);

  return (
    <ProductFormProvider
      defaultValues={formData}
      productId={productId}
      initialImages={initialImages}
    >
      <EditProductForm productId={productId} />
    </ProductFormProvider>
  );
}

function EditProductForm({ productId }: { productId: string }) {
  const methods = useFormContext<ProductFormValues>();
  const { onSubmit, isPending } = useContext(ProductFormContext);

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {/* Header */}
      <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='outline'>
            <ArrowBigLeft />
          </Button>
          <h1 className='text-2xl font-bold'>Edit Product</h1>
        </div>
        <div className='flex items-center justify-end gap-5'>
          <Button variant='outline' type='button'>
            Discard
          </Button>
          <Button type='submit' className='gap-2' disabled={isPending}>
            {isPending ? (
              'Updating...'
            ) : (
              <>
                <Plus className='h-4 w-4' />
                Update Product
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
        <div className='space-y-6 md:col-span-8'>
          {/* Left Column Cards */}
          <BasicInformationCard productId={productId} />
          <PricingAndInventory />
          <ProductDimensions />
          <ProductVariant />
        </div>
        <div className='space-y-6 md:col-span-4'>
          {/* Right Column Cards */}
          <ProductImagesCard />
          <ProductStatus />
          <ProductCondition productId={productId} />
          <ProductSeo />
        </div>
      </div>
    </form>
  );
}
