'use client';

import { createContext } from 'react';


import { ProductFormValues } from './product-form-type';

export interface ProductFormContextType {
//   selectedCategory: string;
//   setSelectedCategory: (category: string) => void;
//   productImages: ProductImage[];
//   setProductImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
  onSubmit: (data: ProductFormValues) => void;
}

export const ProductFormContext = createContext<ProductFormContextType>({
//   selectedCategory: '',
//   setSelectedCategory: () => {},
//   productImages: [],
//   setProductImages: () => {},
  onSubmit: () => {},
});
