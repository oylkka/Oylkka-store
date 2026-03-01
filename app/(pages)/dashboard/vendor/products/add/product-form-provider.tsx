'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { ProductImage } from '@/hooks/use-product-image';
import { cleanFormData } from '@/lib/utils';
import {
  useAdminUpdateProduct,
  useCreateProduct,
  useUpdateProduct,
} from '@/services';

import { ProductFormContext } from './product-form-context';
import {
  type ProductFormInput,
  ProductFormSchema,
  type ProductFormValues,
} from './product-form-type';

interface ProductFormProviderProps {
  children: ReactNode;
  defaultValues?: Partial<ProductFormInput>;
  productId?: string;
  initialImages?: ProductImage[];
  isAdmin?: boolean;
}

export function ProductFormProvider({
  children,
  defaultValues,
  productId,
  initialImages,
  isAdmin = false,
}: ProductFormProviderProps) {
  const [productImages, setProductImages] = useState<ProductImage[]>(
    initialImages || [],
  );
  const methods = useForm<ProductFormInput>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: defaultValues || {
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

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      methods.reset(defaultValues);
    }
  }, [defaultValues, methods]);

  const { mutate: createMutate, isPending: createIsPending } =
    useCreateProduct();
  const { mutate: vendorUpdateMutate, isPending: vendorUpdateIsPending } =
    useUpdateProduct({
      productId: productId || '',
    });
  const { mutate: adminUpdateMutate, isPending: adminUpdateIsPending } =
    useAdminUpdateProduct({
      productId: productId || '',
    });

  let mutate = createMutate;
  let isPending = createIsPending;

  if (productId) {
    if (isAdmin) {
      mutate = adminUpdateMutate;
      isPending = adminUpdateIsPending;
    } else {
      mutate = vendorUpdateMutate;
      isPending = vendorUpdateIsPending;
    }
  }

  const onSubmit = (data: ProductFormValues) => {
    const hasNewImages = productImages.some((img) => img.file !== null);
    const hasExistingImages = productImages.length > 0;
    if (!hasNewImages && !hasExistingImages) {
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

    // Append product images (only new files, not existing images from server)
    productImages.forEach((img) => {
      if (img.file) {
        formData.append('productImages', img.file);
      }
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
    const isUpdateMode = !!productId;
    toast.promise(
      new Promise((resolve, reject) => {
        mutate(formData, {
          onSuccess: (response) => {
            if (isUpdateMode) {
              toast.success('Product updated successfully!');
            } else {
              toast.success('Product submitted successfully!');
              setProductImages([]);
              methods.reset();
            }
            resolve(response);
          },
          onError: (err) => {
            reject(err);
          },
        });
      }),
      {
        loading: isUpdateMode ? 'Updating product...' : 'Submitting product...',
        error: (err) =>
          err?.response?.data?.message ||
          (isUpdateMode
            ? 'Failed to update product'
            : 'Failed to submit product'),
      },
    );
  };

  return (
    <ProductFormContext.Provider
      value={{
        productImages,
        setProductImages,
        onSubmit,
        isPending,
      }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </ProductFormContext.Provider>
  );
}
