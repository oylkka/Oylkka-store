import { z } from 'zod';

// Schema for variant options (e.g., sizes, colors)
export const VariantOptionSchema = z.object({
  name: z.string().min(1, 'Option name is required'),
  values: z.array(z.string()).min(1, 'At least one option value is required'),
});

// Schema for individual variant combination
export const VariantSchema = z.object({
  id: z.string(),
  combination: z.record(z.string(), z.string()),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  discountPrice: z.coerce.number().optional(),
  discountPercent: z.coerce
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .optional(),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  sku: z.string().optional(),
  images: z.array(z.string()),
});

// Base schema for product form
export const baseSchema = z.object({
  productname: z
    .string()
    .min(2, { message: 'Product name must be at least 2 characters.' }),
  description: z
    .string()
    .min(2, { message: 'Description must be at least 2 characters.' }),
  category: z
    .string()
    .min(2, { message: 'Category must be at least 2 characters.' }),
  subcategory: z
    .string()
    .min(2, { message: 'Subcategory must be at least 2 characters.' }),
  tags: z.array(z.string()).nonempty('Please at least add one tag'),
  // Base price (will be used if no variants are defined)
  price: z.coerce
    .number()
    .min(0.01, { message: 'Price must be greater than 0' }),
  discountPrice: z.coerce.number().optional(),
  discountPercent: z.coerce
    .number()
    .min(0, { message: 'Discount cannot be negative' })
    .max(100, { message: 'Discount cannot exceed 100%' })
    .optional(),
  stock: z.coerce
    .number()
    .min(0, { message: 'Stock cannot be negative' })
    .optional(),
  lowStockAlert: z.coerce
    .number()
    .min(0, { message: 'Low stock alert cannot be negative' })
    .optional(),
  // Variant related fields
  hasVariants: z.boolean().default(false),
  variantOptions: z.array(VariantOptionSchema).optional(),
  variants: z.array(VariantSchema).optional(),
  // Shipping fields
  weight: z.coerce
    .number()
    .min(0, { message: 'Weight cannot be negative' })
    .optional(),
  weightUnit: z.string().optional(),
  length: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  shippingClass: z.string().optional(),
  brand: z.string().optional(),
  vendor: z.string().optional(),
  collections: z.string().optional(),
  // Advanced Options fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  socialImage: z.string().optional(),
  preOrderDate: z.string().optional(),
});

// Refined schema with additional validation
export const FormSchema = baseSchema.refine(
  (data) => {
    if (data.lowStockAlert === undefined || data.stock === undefined) {
      return true;
    }
    return data.lowStockAlert <= data.stock;
  },
  {
    message: 'Low stock alert must be less than or equal to current stock',
    path: ['lowStockAlert'],
  }
);

export type FormValues = z.infer<typeof FormSchema>;
export type VariantOption = z.infer<typeof VariantOptionSchema>;
export type Variant = z.infer<typeof VariantSchema>;

// Type for product image
export interface ProductImage {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
  variantId?: string;
}
