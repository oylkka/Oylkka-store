'use client';

import { createContext } from 'react';

import type { ProductImage } from '@/hooks/use-product-image';

import type { ProductFormValues } from './product-form-type';

export interface ProductFormContextType {
  productImages: ProductImage[];
  setProductImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
  onSubmit: (data: ProductFormValues) => void;
  isPending?: boolean;
}

export const ProductFormContext = createContext<ProductFormContextType>({
  productImages: [],
  setProductImages: () => {},
  onSubmit: () => {},
  isPending: false,
});
