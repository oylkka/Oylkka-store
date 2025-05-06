'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { ProductImage } from '@/hooks/use-product-image';
import { cleanFormData } from '@/lib/utils';
import { useCreateProduct } from '@/services';

import { ProductFormContext } from './product-form-context';
import {
  type ProductFormInput,
  ProductFormSchema,
  type ProductFormValues,
} from './product-form-type';

interface ProductFormProviderProps {
  children: ReactNode;
}

export function ProductFormProvider({ children }: ProductFormProviderProps) {
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const methods = useForm<ProductFormInput>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      productName: '',
      description: '',
      slug: '',
      category: '',
      brand: '',
      tags: [],
      price: 0,
      stock: 0,
      lowStockAlert: 5,
      sku: '',
      condition: 'NEW',
      conditionDescription: '',
      weight: 0,
      weightUnit: 'kg',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm',
      },
      freeShipping: false,
      metaTitle: '',
      metaDescription: '',
      attributes: {},
      status: 'DRAFT',
      featured: false,
      variants: [],
    },
  });

  const { mutate } = useCreateProduct();

  const onSubmit = (data: ProductFormValues) => {
    if (productImages.length === 0) {
      methods.setError('root.images', {
        type: 'manual',
        message: 'At least one product image is required',
      });
      return;
    }

    const cleaned = cleanFormData(data);
    const formData = new FormData();

    // Append primitive and object fields
    for (const key in cleaned) {
      const value = cleaned[key as keyof typeof cleaned];

      // Handle tags
      if (key === 'tags' && Array.isArray(value)) {
        (value as string[]).forEach((tag) => {
          formData.append('tags', tag);
        });
      }

      // Handle other special cases
      else if (
        key === 'variants' ||
        key === 'attributes' ||
        key === 'dimensions'
      ) {
        formData.append(key, JSON.stringify(value));
      }

      // Handle primitives
      else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    // Append product images
    productImages.forEach((img) => {
      formData.append('productImages', img.file);
    });

    // Handle variant images separately
    if (cleaned.variants && Array.isArray(cleaned.variants)) {
      cleaned.variants.forEach((variant, index) => {
        if (variant.image instanceof File) {
          // Use the variant ID or index as identifier
          const variantId = variant.id || `variant-${index}`;
          formData.append(`variantImage_${variantId}`, variant.image);
        }
      });
    }

    // Submit
    toast.promise(
      new Promise((resolve, reject) => {
        mutate(formData, {
          onSuccess: (response) => {
            toast.success('Product submitted successfully!');
            // setProductImages([]);
            // methods.reset();
            resolve(response);
          },
          onError: (err) => {
            reject(err);
          },
        });
      }),
      {
        loading: 'Submitting product...',
        error: (err) =>
          err?.response?.data?.message || 'Failed to submit product',
      }
    );
  };

  return (
    <ProductFormContext.Provider
      value={{
        productImages,
        setProductImages,
        onSubmit,
      }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </ProductFormContext.Provider>
  );
}
