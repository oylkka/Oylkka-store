import { z } from 'zod';

// Enums
// const ProductConditionEnum = z.enum([
//   'NEW',
//   'USED',
//   'LIKE_NEW',
//   'EXCELLENT',
//   'GOOD',
//   'FAIR',
//   'POOR',
//   'FOR_PARTS',
// ]);

// const ProductStatusEnum = z.enum([
//   'DRAFT',
//   'PUBLISHED',
//   'ARCHIVED',
//   'OUT_OF_STOCK',
// ]);

// Type schemas
const DimensionsSchema = z
  .object({
    length: z.number().min(0, { message: 'Length must be a positive number' }),
    width: z.number().min(0, { message: 'Width must be a positive number' }),
    height: z.number().min(0, { message: 'Height must be a positive number' }),
    unit: z.string().refine((val) => ['cm', 'in', 'm'].includes(val), {
      message: 'Dimension unit must be cm, in, or m',
    }),
  })
  .partial()
  .refine(
    (data) => {
      // If any dimension field is provided, all should be provided
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
    }
  );

// const AttributesSchema = z
//   .record(
//     z.string(), // Attribute key: color, size, custom-attr, etc.
//     z.union([z.string(), z.array(z.string())])
//   )
//   .optional()
//   .refine(
//     (attrs) =>
//       !attrs ||
//       Object.values(attrs).every(
//         (val) =>
//           typeof val === 'string' || (Array.isArray(val) && val.length > 0)
//       ),
//     {
//       message:
//         'Each attribute must be a string or a non-empty array of strings',
//     }
//   );

// Main Product Schema
export const ProductFormSchema = z.object({
  // Basic Information
  productName: z
    .string()
    .min(2, { message: 'Product name must be at least 2 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' }),
  slug: z.string().min(1, { message: 'Slug is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  brand: z
    .string()
    .min(1, { message: 'Brand is required' })
    .max(40, { message: 'Brand must be at most 40 characters' }),
  tags: z
    .array(z.string())
    .max(10, { message: 'You can add a maximum of 10 tags' })
    .optional()
    .default([]),

  // Identifiers
  // sku: z
  //   .string()
  //   .min(1, 'SKU is required')
  //   .refine((val) => SkuService.isValidSku(val), {
  //     message: 'Invalid SKU format. Should follow pattern like CAT-PRD-001',
  //   }),

  // Price & Stock
  price: z.number().min(0.01, { message: 'Price must be greater than 0' }),
  discountPrice: z
    .number()
    .min(0.01, { message: 'Discount price must be greater than 0' })
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

  // Condition
  // condition: ProductConditionEnum,
  // conditionDescription: z.string().optional(),

  // Shipping & Dimensions
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

  // Variants and Attributes

  // attributes: AttributesSchema.optional(),

  // Status and Visibility
  // status: ProductStatusEnum,
});
// .refine(
//   (data) => {
//     if (data.discountPrice === undefined) {
//       return true;
//     }
//     return data.discountPrice < data.price;
//   },
//   {
//     message: 'Discount price must be less than regular price',
//     path: ['discountPrice'],
//   }
// )
// .refine(
//   (data) => {
//     // Calculate expected discount percent if discountPrice exists
//     if (data.discountPrice) {
//       const calculatedPercent = Math.round(
//         ((data.price - data.discountPrice) / data.price) * 100
//       );
//       return data.discountPercent === calculatedPercent;
//     }
//     return true;
//   },
// {
//   message: 'Discount percent does not match calculated value',
//   path: ['discountPercent'],
// }
// )
// .refine(
//   (data) => {
//     // Require condition description for specific conditions
//     const needsDescription = [
//       'USED',
//       'GOOD',
//       'FAIR',
//       'POOR',
//       'FOR_PARTS',
//     ].includes(data.condition);
//     return (
//       !needsDescription ||
//       (data.conditionDescription && data.conditionDescription.length > 0)
//     );
//   },
//   {
//     message: 'Condition description is required for this condition',
//     path: ['conditionDescription'],
//   }
// );

// Type export
export type ProductFormInput = z.input<typeof ProductFormSchema>;
export type ProductFormValues = z.output<typeof ProductFormSchema>;
