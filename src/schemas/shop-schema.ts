import * as z from 'zod';

const BaseShopSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const imageValidation = z
  .any()
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
  );

export const ShopApplicationFormSchema = BaseShopSchema.extend({
  logo: imageValidation,
  banner: imageValidation,
});

export const EditShopFormSchema = BaseShopSchema.extend({
  logo: z.any().optional(),
  banner: z.any().optional(),
  hasExistingLogo: z.boolean().optional(),
  keepExistingLogo: z.boolean().optional(),
  hasExistingBanner: z.boolean().optional(),
  keepExistingBanner: z.boolean().optional(),
});

export const ShopApiSchema = BaseShopSchema;

export type ShopApplicationFormType = z.infer<typeof ShopApplicationFormSchema>;
export type EditShopFormType = z.infer<typeof EditShopFormSchema>;
