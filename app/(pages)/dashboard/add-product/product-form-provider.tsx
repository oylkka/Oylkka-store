// components/product/ProductFormProvider.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { ProductImage } from '@/hooks/use-product-image';

import { ProductFormContext } from './product-form-context';
import { ProductFormSchema, ProductFormValues } from './product-form-type';

interface ProductFormProviderProps {
  children: ReactNode;
}

export function ProductFormProvider({ children }: ProductFormProviderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  // components/product/ProductFormProvider.tsx
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

  // components/product/ProductFormProvider.tsx
  function onSubmit(data: ProductFormValues) {
    // Check if there's at least one image uploaded
    if (productImages.length === 0) {
      // Show an error using React Hook Form's setError function
      methods.setError('root.images', {
        type: 'manual',
        message: 'At least one product image is required',
      });
      return; // Prevent form submission
    }

    // Check if there's a cover image selected
    if (!productImages.some((img) => img.isCover)) {
      // If there are images but no cover image is set, set the first one as cover
      const updatedImages = [...productImages];
      updatedImages[0].isCover = true;
      setProductImages(updatedImages);
    }

    // Create form data to handle file uploads
    const formData = new FormData();

    // Append all form values
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          // Handle arrays like tags
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add product images to formData
    productImages.forEach((image, index) => {
      formData.append(`image_${index}`, image.file);

      // Mark cover image
      if (image.isCover) {
        formData.append('cover_image_index', String(index));
      }
    });

    // Log the submitted data
    // console.table(data);

    // Log the images information
    // console.log(
    //   'Product Images:',
    //   productImages.map((img) => ({
    //     filename: img.file.name,
    //     size: `${(img.file.size / 1024).toFixed(2)} KB`,
    //     isCover: img.isCover,
    //   }))
    // );

    // Log which image is the cover
    // const coverImage = productImages.find((img) => img.isCover);
    // if (coverImage) {
    //   console.log('Cover Image:', {
    //     filename: coverImage.file.name,
    //     size: `${(coverImage.file.size / 1024).toFixed(2)} KB`,
    //   });
    // }

    // TODO: Send formData to your API
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
