import { z } from 'zod';

export const onboardingSchema = z
  .object({
    id: z.string(),
    name: z.string().min(3, 'Must be at least 3 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(
        /^[a-zA-Z0-9._]+$/,
        'Username can only contain letters, numbers, periods, and underscores'
      ),
    email: z.string().email('Invalid email address'),
    avatar: z.instanceof(File).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10,15}$/, 'Mobile number must be between 10-15 digits'),

    role: z.enum(['CUSTOMER', 'VENDOR'], {
      required_error: 'Please select a role',
    }),

    shopName: z.string().min(3, 'Must be at least 3 characters').optional(),
    shopSlug: z
      .string()
      .min(3, 'Must be at least 3 characters')
      .regex(/^[a-z0-9-]+$/, {
        message: 'Use lowercase letters, numbers, or hyphens',
      })
      .optional(),
    shopDescription: z.string().optional(),
    shopEmail: z.string().email('Invalid email address').optional(),
    shopPhone: z.string().optional(),
    shopCategory: z.string().optional(),
    shopAddress: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'VENDOR') {
      if (!data.shopName) {
        ctx.addIssue({
          path: ['shopName'],
          code: z.ZodIssueCode.custom,
          message: 'Shop name is required for vendors',
        });
      }

      if (!data.shopSlug) {
        ctx.addIssue({
          path: ['shopSlug'],
          code: z.ZodIssueCode.custom,
          message: 'Shop slug is required for vendors',
        });
      }

      if (!data.shopEmail) {
        ctx.addIssue({
          path: ['shopEmail'],
          code: z.ZodIssueCode.custom,
          message: 'Shop email is required for vendors',
        });
      }

      if (!data.shopPhone) {
        ctx.addIssue({
          path: ['shopPhone'],
          code: z.ZodIssueCode.custom,
          message: 'Shop phone is required for vendors',
        });
      }

      if (!data.shopCategory) {
        ctx.addIssue({
          path: ['shopCategory'],
          code: z.ZodIssueCode.custom,
          message: 'Shop category is required for vendors',
        });
      }

      if (!data.shopAddress) {
        ctx.addIssue({
          path: ['shopAddress'],
          code: z.ZodIssueCode.custom,
          message: 'Shop address is required for vendors',
        });
      }
    }
  });

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
