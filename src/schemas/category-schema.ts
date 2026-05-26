import * as z from 'zod';

const BaseCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
});

export const CategoryFormSchema = BaseCategorySchema.extend({
  image: z
    .custom<FileList | null>()
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        (files instanceof FileList &&
          ['image/jpeg', 'image/png', 'image/webp'].includes(files[0]?.type)),
      { message: 'Image must be JPEG, PNG, or WEBP' },
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        (files instanceof FileList && files[0]?.size <= 512000),
      { message: 'Image size must not exceed 500KB' },
    ),
});

export const EditCategoryFormSchema = BaseCategorySchema.extend({
  image: z.custom<FileList | null>().optional(),
  hasExistingImage: z.boolean().optional(),
  keepExistingImage: z.boolean().optional(),
});

export const CategoryApiSchema = BaseCategorySchema;

export type CategoryFormType = z.infer<typeof CategoryFormSchema>;
export type EditCategoryFormType = z.infer<typeof EditCategoryFormSchema>;
