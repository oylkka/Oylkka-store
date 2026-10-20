import { Loader2, Package } from 'lucide-react';
import { useMemo } from 'react';

import { NewProductPage } from '@/components/forms/product/product-page';
import { useProduct } from '@/services/product';

/**
 * Product editing surface shared by the vendor dashboard and the admin
 * console. The vendor route owns no logic beyond its guard and search params;
 * everything that turns a fetched product into form defaults lives here so
 * both screens cannot drift apart.
 */
export function ProductEditView({ productId }: { productId?: string }) {
  const { data: product, isLoading } = useProduct(productId);

  const defaultValues = useMemo(() => {
    if (!product) return undefined;
    return {
      productName: product.productName,
      description: product.description,
      category: product.categoryId,
      tags: product.tags,
      sku: product.sku,
      brand: product.brand ?? '',
      price: product.price,
      discountPrice: product.discountPrice ?? undefined,
      stock: product.stock,
      condition: product.condition as
        | 'NEW'
        | 'USED'
        | 'LIKE_NEW'
        | 'EXCELLENT'
        | 'GOOD'
        | 'FAIR'
        | 'POOR'
        | 'FOR_PARTS',
      conditionDescription: product.conditionDescription ?? '',
      weight: product.weight ?? undefined,
      weightUnit: product.weightUnit as 'kg' | 'g' | 'lb' | 'oz',
      dimensions: {
        length: product.dimensionLength ?? undefined,
        width: product.dimensionWidth ?? undefined,
        height: product.dimensionHeight ?? undefined,
        unit: product.dimensionUnit as 'cm' | 'in' | 'm',
      },
      freeShipping: product.freeShipping,
      metaTitle: product.metaTitle ?? '',
      metaDescription: product.metaDescription ?? '',
      status: product.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      featured: product.featured,
      slug: product.slug,
      // FE-45: without this, `reset()` would wipe the product's attributes in
      // the form (they are absent from the scalar payload), making them
      // impossible to view or keep. Rebuild the value entries.
      attributes:
        product.attributeOptions && product.attributeOptions.length > 0
          ? Object.fromEntries(
              product.attributeOptions.map((option) => [
                option.name,
                {
                  values: option.attributeValues.map((av) => ({
                    id: av.id,
                    value: av.value,
                    slug: av.slug,
                    displayOrder: av.displayOrder,
                    imageUrl: av.imageUrl,
                    imagePublicId: av.imagePublicId,
                    metadata: av.metadata,
                    priceModifier: av.priceModifier ?? undefined,
                  })),
                  isVariantDefining: option.isVariantDefining,
                  displayOrder: option.displayOrder,
                },
              ]),
            )
          : undefined,
    };
  }, [product]);

  const initialImages = useMemo(
    () =>
      product
        ? product.images.map((img) => ({
            id: img.id,
            file: null as null,
            preview: img.imageUrl,
          }))
        : undefined,
    [product],
  );

  if (!productId) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
          <Package className='w-7 h-7 text-muted-foreground' />
        </div>
        <div>
          <p className='text-sm font-semibold'>No product selected</p>
          <p className='text-sm text-muted-foreground mt-1'>
            Choose a product from the list to edit it.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!product) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
          <Package className='w-7 h-7 text-muted-foreground' />
        </div>
        <div>
          <p className='text-sm font-semibold'>Product not found</p>
          <p className='text-sm text-muted-foreground mt-1'>
            The product you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <NewProductPage
      productId={product.id}
      defaultValues={defaultValues}
      initialImages={initialImages}
    />
  );
}
