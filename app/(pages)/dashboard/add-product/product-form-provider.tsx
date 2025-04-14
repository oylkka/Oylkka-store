'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { ProductImage } from '@/hooks/use-product-image';
import { useCreateProduct } from '@/service';

import { ProductFormContext } from './product-form-context';
import { ProductFormSchema, ProductFormValues } from './product-form-type';

interface ProductFormProviderProps {
  children: ReactNode;
}

export function ProductFormProvider({ children }: ProductFormProviderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      productname: '',
      description: '',
      category: '',
      subcategory: '',
      tags: [],
      price: 0,
      discountPrice: undefined,
      discountPercent: 0,
      stock: 0,
      lowStockAlert: 0,
      barcode: '',
      weight: 0,
      weightUnit: 'kg',
      dimensionUnit: 'cm',
      length: 0,
      width: 0,
      height: 0,
      shippingClass: 'standard',
      freeShipping: false,
      variantOptions: [],
      metaTitle: '',
      metaDescription: '',
      sku: '',
      condition: '',
      conditionDescription: '',
    },
  });

  const { mutate } = useCreateProduct();

  function onSubmit(data: ProductFormValues) {
    if (productImages.length === 0) {
      methods.setError('root.images', {
        type: 'manual',
        message: 'At least one product image is required',
      });
      return;
    }

    if (!productImages.some((img) => img.isCover)) {
      const updatedImages = [...productImages];
      updatedImages[0].isCover = true;
      setProductImages(updatedImages);
    }

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const coverImage = productImages.find((img) => img.isCover);
    const additionalImages = productImages.filter((img) => !img.isCover);

    if (coverImage) {
      formData.append('coverImage', coverImage.file);
    }

    additionalImages.forEach((image, index) => {
      formData.append(`additionalImage_${index}`, image.file);
    });

    mutate(formData, {
      onSuccess: () => {
        methods.reset();
        setProductImages([]);
      },
    });
  }

  return (
    <ProductFormContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        productImages,
        setProductImages,
        onSubmit,
      }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </ProductFormContext.Provider>
  );
}
