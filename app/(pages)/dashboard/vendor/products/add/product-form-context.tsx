'use client';

import { createContext } from 'react';

import { ProductFormValues } from './product-form-type';

export interface ProductFormContextType {
  //   productImages: ProductImage[];
  //   setProductImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
  onSubmit: (data: ProductFormValues) => void;
}

export const ProductFormContext = createContext<ProductFormContextType>({
  //   productImages: [],
  //   setProductImages: () => {},
  onSubmit: () => {},
});
