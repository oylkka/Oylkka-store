'use client';

import { useCreateProduct } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ProductImage } from '@/hooks/use-product-image';
import { ProductFormContext } from './product-form-context';
import {
  ProductFormInput,
  ProductFormSchema,
  ProductFormValues,
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
      // sku: '',
      // condition: 'NEW',
      // conditionDescription: '',
      weight: 0,
      weightUnit: 'kg',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm',
      },
      freeShipping: false,
      // status: 'DRAFT',
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

    const formData = new FormData();

    // Append primitives
    const primitiveFields: (keyof ProductFormValues)[] = [
      'productName',
      'description',
      'slug',
      'category',
      'brand',
      'tags',
      'price',
      'discountPrice',
      'discountPercent',
      'stock',
      'lowStockAlert',
      'weight',
      'weightUnit',
      'dimensions',
      'freeShipping',
      // 'sku',
      // 'condition',
      // 'conditionDescription',
      // 'status',
    ];
    primitiveFields.forEach((field) => {
      const value = data[field];
      if (value !== undefined) {
        formData.append(field, String(value));
      }
    });

    // Append arrays
    const arrayFields: (keyof ProductFormValues)[] = ['tags'];
    arrayFields.forEach((field) => {
      const value = data[field];
      if (Array.isArray(value) && value.length > 0) {
        formData.append(field, JSON.stringify(value));
      }
    });

    // Append objects
    const objectFields: (keyof ProductFormValues)[] = [
      'dimensions',
      // 'attributes',
    ];
    objectFields.forEach((field) => {
      const value = data[field];
      if (value && typeof value === 'object' && Object.keys(value).length > 0) {
        formData.append(field, JSON.stringify(value));
      }
    });

    // Append product images
    const imageFiles = productImages.map((img) => img.file);
    imageFiles.forEach((file) => {
      formData.append('productImages[]', file);
    });

    // Clean up empty attribute values before submit
    // if (data.attributes) {
    //   for (const key in data.attributes) {
    //     const val = data.attributes[key];
    //     if (
    //       (typeof val === 'string' && val.trim() === '') ||
    //       (Array.isArray(val) && val.length === 0)
    //     ) {
    //       delete data.attributes[key];
    //     }
    //   }
    // }

    // Wrap mutate in toast.promise
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
