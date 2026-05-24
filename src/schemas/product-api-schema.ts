import { z } from 'zod';

export const ProductConditionEnum = z.enum([
  'NEW',
  'USED',
  'LIKE_NEW',
  'EXCELLENT',
  'GOOD',
  'FAIR',
  'POOR',
  'FOR_PARTS',
]);

export const ProductStatusEnum = z.enum([
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'OUT_OF_STOCK',
]);

const VariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discountPrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  attributes: z.record(z.string(), z.string()),
});

const AttributesSchema = z
  .record(z.string(), z.union([z.string(), z.array(z.string())]))
  .optional();

const DimensionsSchema = z
  .object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    unit: z.enum(['cm', 'in', 'm']).optional(),
  })
  .optional();

export const ProductApiCreateSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  tags: z.array(z.string()).default([]),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discountPrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockAlert: z.number().int().min(0).default(5),
  brand: z.string().max(40).optional().nullable(),
  condition: ProductConditionEnum.default('NEW'),
  conditionDescription: z.string().optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  weightUnit: z.enum(['kg', 'g', 'lb', 'oz']).default('kg'),
  freeShipping: z.boolean().default(false),
  dimensions: DimensionsSchema,
  hasVariants: z.boolean().default(false),
  attributes: AttributesSchema,
  variants: z.array(VariantSchema).optional().default([]),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  status: ProductStatusEnum.default('DRAFT'),
  featured: z.boolean().default(false),
});

export const ProductApiEditSchema = ProductApiCreateSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
  keepExistingImage: z.boolean().optional(),
  removedGalleryIds: z.array(z.string()).optional().default([]),
  category: z.string().optional(),
});

export type ProductApiCreateInput = z.input<typeof ProductApiCreateSchema>;
export type ProductApiEditInput = z.input<typeof ProductApiEditSchema>;
