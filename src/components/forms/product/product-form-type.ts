import { z } from 'zod';

import { SkuService } from '@/services/sku-service';

const ProductConditionEnum = z.enum([
  'NEW',
  'USED',
  'LIKE_NEW',
  'EXCELLENT',
  'GOOD',
  'FAIR',
  'POOR',
  'FOR_PARTS',
]);

const ProductStatusEnum = z.enum([
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'OUT_OF_STOCK',
]);

const DimensionsSchema = z
  .object({
    length: z.number().min(0, { message: 'Length must be a positive number' }),
    width: z.number().min(0, { message: 'Width must be a positive number' }),
    height: z.number().min(0, { message: 'Height must be a positive number' }),
    unit: z.enum(['cm', 'in', 'm'], {
      message: 'Dimension unit must be cm, in, or m',
    }),
  })
  .partial()
  .refine(
    (data) => {
      if (Object.values(data).some((val) => val !== undefined)) {
        return (
          data.length !== undefined &&
          data.width !== undefined &&
          data.height !== undefined &&
          data.unit !== undefined
        );
      }
      return true;
    },
    {
      message:
        'All dimension fields (length, width, height, unit) must be provided together or not at all',
    },
  );

const AttributesSchema = z
  .record(z.string(), z.union([z.string(), z.array(z.string())]))
  .optional()
  .refine(
    (attrs) =>
      !attrs ||
      Object.entries(attrs).every(([key, val]) => {
        if (key.trim() === '') return false;
        if (typeof val === 'string') return val.trim() !== '';
        return (
          Array.isArray(val) &&
          val.length > 0 &&
          val.every((v) => v.trim() !== '')
        );
      }),
    { message: 'Attributes must have non-empty keys and values' },
  );

const VariantAttributesSchema = z
  .record(z.string(), z.string())
  .refine(
    (attrs) =>
      Object.entries(attrs).every(
        ([key, val]) => key.trim() !== '' && val.trim() !== '',
      ),
    { message: 'Variant attributes must have non-empty keys and values' },
  );

export const ProductVariantSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, { message: 'Variant name is required' }),
    sku: z.string().min(1, { message: 'SKU is required' }),
    price: z.number().min(0.01, { message: 'Price must be greater than 0' }),
    discountPrice: z
      .union([
        z.number().min(0, { message: 'Discount price must be non-negative' }),
        z
          .string()
          .transform((val) => (val === '' ? 0 : Number.parseFloat(val))),
      ])
      .optional()
      .default(0),
    stock: z
      .number()
      .int({ message: 'Stock must be a whole number' })
      .min(0, { message: 'Stock cannot be negative' }),
    attributes: VariantAttributesSchema,
    image: z.any().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.discountPrice && data.discountPrice > 0) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: 'Discount price must be less than regular price',
      path: ['discountPrice'],
    },
  );

export const ProductFormSchema = z
  .object({
    productName: z
      .string()
      .min(2, { message: 'Product name must be at least 2 characters' }),
    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters' }),
    category: z.string().min(1, { message: 'Category is required' }),
    slug: z
      .string()
      .min(1, { message: 'Slug is required' })
      .regex(/^[a-z0-9-]+$/, {
        message:
          'Slug should only contain lowercase letters, numbers, and hyphens',
      }),
    tags: z
      .array(z.string())
      .min(1, { message: 'At least one tag is required' })
      .max(10, { message: 'You can add a maximum of 10 tags' })
      .default([]),

    sku: z
      .string()
      .min(1, 'SKU is required')
      .refine((val) => SkuService.isValidSku(val), {
        message: 'Invalid SKU format. Should follow pattern like CAT-PRD-001',
      }),

    price: z.number().min(0.01, { message: 'Price must be greater than 0' }),
    discountPrice: z
      .number()
      .min(0, { message: 'Discount price must be non-negative' })
      .optional(),
    discountPercent: z
      .number()
      .min(0, { message: 'Discount percent must be at least 0' })
      .max(100, { message: 'Discount percent cannot exceed 100%' })
      .optional()
      .default(0),
    stock: z.number().int().min(1, { message: 'Stock must be at least 1' }),
    lowStockAlert: z
      .number()
      .int()
      .min(1, { message: 'Low stock alert must be at least 1' })
      .default(5),

    brand: z
      .string()
      .max(40, { message: 'Brand must be at most 40 characters' })
      .optional(),
    condition: ProductConditionEnum,
    conditionDescription: z.string().optional(),

    weight: z
      .number()
      .min(0, { message: 'Weight must be at least 0' })
      .optional(),
    weightUnit: z
      .string()
      .refine((val) => ['kg', 'g', 'lb', 'oz'].includes(val), {
        message: 'Weight unit must be kg, g, lb, or oz',
      })
      .default('kg'),
    dimensions: DimensionsSchema.optional(),
    freeShipping: z.boolean().default(false),

    attributes: AttributesSchema.optional(),
    variants: z.array(ProductVariantSchema).optional().default([]),

    metaTitle: z.string().optional(),
    metaDescription: z
      .string()
      .max(160, {
        message: 'Meta description should be at most 160 characters',
      })
      .optional(),

    status: ProductStatusEnum,
    featured: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => {
      if (data.discountPrice === undefined) return true;
      return data.discountPrice < data.price;
    },
    {
      message: 'Discount price must be less than regular price',
      path: ['discountPrice'],
    },
  )
  .refine(
    (data) => {
      if (data.discountPrice && data.discountPrice > 0) {
        const calculatedPercent = Math.round(
          ((data.price - data.discountPrice) / data.price) * 100,
        );
        return data.discountPercent === calculatedPercent;
      }
      return true;
    },
    {
      message: 'Discount percent does not match calculated value',
      path: ['discountPercent'],
    },
  )
  .refine(
    (data) => {
      const needsDescription = [
        'USED',
        'GOOD',
        'FAIR',
        'POOR',
        'FOR_PARTS',
      ].includes(data.condition);
      return (
        !needsDescription ||
        (data.conditionDescription && data.conditionDescription.length > 0)
      );
    },
    {
      message: 'Condition description is required for this condition',
      path: ['conditionDescription'],
    },
  )
  .refine(
    (data) => {
      if (!data.variants || data.variants.length === 0) return true;
      const skus = data.variants.map((v) => v.sku);
      return new Set(skus).size === skus.length;
    },
    {
      message: 'Variant SKUs must be unique',
      path: ['variants'],
    },
  )
  .refine(
    (data) => {
      if (!data.variants || data.variants.length <= 1) return true;
      const attributeSets = data.variants.map((v) =>
        JSON.stringify(Object.entries(v.attributes).sort()),
      );
      return new Set(attributeSets).size === attributeSets.length;
    },
    {
      message: 'Variants must have unique attribute combinations',
      path: ['variants'],
    },
  );

export type ProductFormInput = z.input<typeof ProductFormSchema>;
export type ProductFormValues = z.output<typeof ProductFormSchema>;
export type VariantAttributes = z.infer<typeof VariantAttributesSchema>;
