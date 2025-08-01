import * as z from 'zod';

// Base schema with common fields
const BaseBannerSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  bannerTag: z.string().optional(),
  alignment: z.enum(['left', 'center', 'right'], {
    required_error: 'Please select an alignment',
  }),
  primaryActionText: z.string().optional(),
  primaryActionLink: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith('http'),
      'URL must start with http:// or https://',
    ),
  secondaryActionText: z.string().optional(),
  secondaryActionLink: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith('http'),
      'URL must start with http:// or https://',
    ),
  bannerPosition: z.enum(['home_top', 'home_bottom', 'sidebar', 'footer'], {
    required_error: 'Please select a position',
  }),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Schema for creating new banners (image required)
export const BannerFormSchema = BaseBannerSchema.extend({
  image: z
    .any()
    .refine(
      (files) =>
        files &&
        files.length > 0 &&
        files instanceof FileList &&
        ['image/jpeg', 'image/png', 'image/webp'].includes(files[0]?.type),
      {
        message: 'An image file (JPEG, PNG, or WEBP) is required',
      },
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        (files instanceof FileList && files[0]?.size <= 512000), // 500KB = 512000 bytes
      {
        message: 'Image size must not exceed 500KB',
      },
    ),
})
  .refine(
    (data) =>
      !data.endDate ||
      !data.startDate ||
      new Date(data.endDate) > new Date(data.startDate),
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  )
  .refine((data) => !data.secondaryActionText || data.secondaryActionLink, {
    message: 'Secondary action link is required when text is provided',
    path: ['secondaryActionLink'],
  })
  .refine((data) => !data.primaryActionText || data.primaryActionLink, {
    message: 'Primary action link is required when text is provided',
    path: ['primaryActionLink'],
  });

// Schema for editing existing banners (image optional but required if current image is removed)
export const EditBannerFormSchema = BaseBannerSchema.extend({
  image: z.any().optional(),
  hasExistingImage: z.boolean().optional(), // Track if there's an existing image
  keepExistingImage: z.boolean().optional(), // Track if user wants to keep existing image
})
  .refine(
    (data) => {
      // If there's no existing image, new image is required
      if (!data.hasExistingImage) {
        return (
          data.image && data.image.length > 0 && data.image instanceof FileList
        );
      }

      // If existing image is being kept, no new image needed
      if (data.keepExistingImage) {
        return true;
      }

      // If existing image is removed, new image is required
      return (
        data.image && data.image.length > 0 && data.image instanceof FileList
      );
    },
    {
      message:
        'An image is required. Please upload a new image or keep the existing one.',
      path: ['image'],
    },
  )
  .refine(
    (data) => {
      // If no files selected, it's valid (keeping existing or no validation needed)
      if (!data.image || data.image.length === 0) return true;

      // If files are selected, validate them
      return (
        data.image instanceof FileList &&
        ['image/jpeg', 'image/png', 'image/webp'].includes(data.image[0]?.type)
      );
    },
    {
      message: 'Image must be JPEG, PNG, or WEBP format',
      path: ['image'],
    },
  )
  .refine(
    (data) => {
      // If no files selected, it's valid
      if (!data.image || data.image.length === 0) return true;

      // If files are selected, check size
      return data.image instanceof FileList && data.image[0]?.size <= 512000; // 500KB
    },
    {
      message: 'Image size must not exceed 500KB',
      path: ['image'],
    },
  )
  .refine(
    (data) =>
      !data.endDate ||
      !data.startDate ||
      new Date(data.endDate) > new Date(data.startDate),
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  )
  .refine((data) => !data.secondaryActionText || data.secondaryActionLink, {
    message: 'Secondary action link is required when text is provided',
    path: ['secondaryActionLink'],
  })
  .refine((data) => !data.primaryActionText || data.primaryActionLink, {
    message: 'Primary action link is required when text is provided',
    path: ['primaryActionLink'],
  });

export type BannerFormType = z.infer<typeof BannerFormSchema>;
export type EditBannerFormType = z.infer<typeof EditBannerFormSchema>;
