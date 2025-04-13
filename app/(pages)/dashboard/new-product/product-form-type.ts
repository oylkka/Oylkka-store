// components/product/ProductFormTypes.ts
import { z } from 'zod';

// Define the variant option schema
const VariantOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(z.string()),
});

export const ProductFormSchema = z.object({
  // Basic Information
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
  tags: z
    .array(z.string())
    .nonempty('Please add at least one tag')
    .max(6, { message: 'You can add a maximum of 6 tags' }),

  // Price & Stock
  price: z
    .number()
    .min(0.01, { message: 'Price must be greater than 0' })
    .refine((val) => val > 0, { message: 'Price is required' }),
  discountPrice: z.number().optional(),
  discountPercent: z.number().optional(),
  stock: z
    .number()
    .min(1, { message: 'Stock must be at least 0' })
    .refine((val) => val !== undefined, {
      message: 'Stock quantity is required',
    }),
  lowStockAlert: z
    .number()
    .min(0, { message: 'Alert threshold must be at least 0' }),

  // Shipping & Dimensions
  weight: z
    .number()
    .min(0, { message: 'Weight must be at least 0' })
    .optional(),
  length: z
    .number()
    .min(0, { message: 'Length must be at least 0' })
    .optional(),
  width: z.number().min(0, { message: 'Width must be at least 0' }).optional(),
  height: z
    .number()
    .min(0, { message: 'Height must be at least 0' })
    .optional(),
  shippingClass: z.string().optional(),
  freeShipping: z.boolean().default(false).optional(),

  // Variants & Options
  variantOptions: z.array(VariantOptionSchema).optional(),

  // SEO & Meta
  metaTitle: z
    .string()
    .max(60, { message: 'Meta title should be under 60 characters' })
    .optional(),
  metaDescription: z
    .string()
    .max(160, { message: 'Meta description should be under 160 characters' })
    .optional(),
  slug: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;
