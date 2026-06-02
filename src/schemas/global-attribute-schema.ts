import { z } from 'zod';

export const GlobalAttributeValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, 'Value is required'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  hex: z.string().optional().nullable(),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .nullable()
    .default(null),
});

export const GlobalAttributeValueCreateSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  hex: z.string().optional().nullable(),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .nullable()
    .default(null),
});

export const GlobalAttributeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  displayOrder: z.number().int().min(0).default(0),
  values: z.array(GlobalAttributeValueCreateSchema).default([]),
});

export const GlobalAttributeUpdateSchema =
  GlobalAttributeSchema.partial().extend({
    removedValueIds: z.array(z.string()).optional().default([]),
  });

export const ProductGlobalAttributeMappingSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  globalAttributeId: z.string().min(1, 'Global attribute ID is required'),
  localValueId: z.string().min(1, 'Local attribute value ID is required'),
  globalValueId: z.string().min(1, 'Global value ID is required'),
});

export type GlobalAttributeValueInput = z.input<
  typeof GlobalAttributeValueSchema
>;
export type GlobalAttributeInput = z.input<typeof GlobalAttributeSchema>;
export type GlobalAttributeUpdateInput = z.input<
  typeof GlobalAttributeUpdateSchema
>;
export type ProductGlobalAttributeMappingInput = z.input<
  typeof ProductGlobalAttributeMappingSchema
>;
