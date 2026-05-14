import * as z from 'zod';

// ─── Shared validation functions ─────────────────────────────────────────────

function endDateAfterStart(data: { endDate?: Date; startDate?: Date }) {
  return (
    !data.endDate ||
    !data.startDate ||
    new Date(data.endDate) > new Date(data.startDate)
  );
}

function secondaryLinkRequired(data: {
  secondaryActionText?: string;
  secondaryActionLink?: string;
}) {
  return !data.secondaryActionText || data.secondaryActionLink;
}

function primaryLinkRequired(data: {
  primaryActionText?: string;
  primaryActionLink?: string;
}) {
  return !data.primaryActionText || data.primaryActionLink;
}

// ─── URL must start with http ───────────────────────────────────────────────

const httpUrl = (val: string | undefined) => !val || val.startsWith('http');

// ─── Base schema ────────────────────────────────────────────────────────────

const BaseBannerSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  bannerTag: z.enum(['PROMO', 'INFO', 'ANNOUNCEMENT']).optional(),
  alignment: z.enum(['LEFT', 'CENTER', 'RIGHT'], {
    required_error: 'Please select an alignment',
  }),
  primaryActionText: z.string().optional(),
  primaryActionLink: z
    .string()
    .optional()
    .refine(httpUrl, 'URL must start with http:// or https://'),
  secondaryActionText: z.string().optional(),
  secondaryActionLink: z
    .string()
    .optional()
    .refine(httpUrl, 'URL must start with http:// or https://'),
  bannerPosition: z.enum(['HOME_TOP', 'HOME_BOTTOM', 'SIDEBAR'], {
    required_error: 'Please select a position',
  }),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ─── Form schema (client-side, image = FileList) ────────────────────────────

export const BannerFormSchema = BaseBannerSchema.extend({
  image: z
    .any()
    .refine(
      (files) =>
        files &&
        files.length > 0 &&
        files instanceof FileList &&
        ['image/jpeg', 'image/png', 'image/webp'].includes(files[0]?.type),
      { message: 'An image file (JPEG, PNG, or WEBP) is required' },
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        (files instanceof FileList && files[0]?.size <= 512000),
      { message: 'Image size must not exceed 500KB' },
    ),
})
  .refine(endDateAfterStart, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine(secondaryLinkRequired, {
    message: 'Secondary action link is required when text is provided',
    path: ['secondaryActionLink'],
  })
  .refine(primaryLinkRequired, {
    message: 'Primary action link is required when text is provided',
    path: ['primaryActionLink'],
  });

// ─── Edit schema (client-side, image optional) ──────────────────────────────

export const EditBannerFormSchema = BaseBannerSchema.extend({
  image: z.any().optional(),
  hasExistingImage: z.boolean().optional(),
  keepExistingImage: z.boolean().optional(),
})
  .refine(
    (data) => {
      if (!data.hasExistingImage) {
        return (
          data.image && data.image.length > 0 && data.image instanceof FileList
        );
      }
      if (data.keepExistingImage) return true;
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
      if (!data.image || data.image.length === 0) return true;
      return (
        data.image instanceof FileList &&
        ['image/jpeg', 'image/png', 'image/webp'].includes(data.image[0]?.type)
      );
    },
    { message: 'Image must be JPEG, PNG, or WEBP format', path: ['image'] },
  )
  .refine(
    (data) => {
      if (!data.image || data.image.length === 0) return true;
      return data.image instanceof FileList && data.image[0]?.size <= 512000;
    },
    { message: 'Image size must not exceed 500KB', path: ['image'] },
  );

// ─── API schema (server-side, no image — validated separately) ──────────────

export const BannerApiSchema = BaseBannerSchema.refine(endDateAfterStart, {
  message: 'End date must be after start date',
  path: ['endDate'],
})
  .refine(secondaryLinkRequired, {
    message: 'Secondary action link is required when text is provided',
    path: ['secondaryActionLink'],
  })
  .refine(primaryLinkRequired, {
    message: 'Primary action link is required when text is provided',
    path: ['primaryActionLink'],
  });

// ─── Types ──────────────────────────────────────────────────────────────────

export type BannerFormType = z.infer<typeof BannerFormSchema>;
export type EditBannerFormType = z.infer<typeof EditBannerFormSchema>;
export type BannerApiType = z.infer<typeof BannerApiSchema>;
