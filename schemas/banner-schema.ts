import * as z from 'zod';

// Define schema with proper validation messages
export const BannerFormSchema = z
  .object({
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
        'URL must start with http:// or https://'
      ),
    secondaryActionText: z.string().optional(),
    secondaryActionLink: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.startsWith('http'),
        'URL must start with http:// or https://'
      ),
    bannerPosition: z.enum(['home_top', 'home_bottom', 'sidebar', 'footer'], {
      required_error: 'Please select a position',
    }),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
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
        }
      )
      .refine(
        (files) =>
          !files ||
          files.length === 0 ||
          (files instanceof FileList && files[0]?.size <= 512000), // 500KB = 512000 bytes
        {
          message: 'Image size must not exceed 500KB',
        }
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
    }
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
