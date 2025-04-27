import { z } from "zod";

export const onboardingSchema = z
  .object({
    id: z.string(),
    name: z.string().min(3, "Must be at least 3 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9._]+$/,
        "Username can only contain letters, numbers, periods, and underscores",
      ),
    email: z
      .string()
      .trim()
      .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Invalid email address",
      })
      .optional(),
    avatar: z.any().optional(),
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => {
          if (!val) {
            return true;
          } // allow empty (optional)
          return /^(?:\+?88)?01[3-9]\d{8}$/.test(val); // BD number pattern
        },
        {
          message: "Invalid Bangladeshi mobile number",
        },
      ),
    role: z.enum(["CUSTOMER", "VENDOR"], {
      required_error: "Please select a role",
    }),
    // Make all shop fields truly optional at the base level
    shopName: z.string().optional(),
    shopSlug: z.string().optional(),
    shopLogo: z.any().optional(),
    shopBanner: z.any().optional(),
    shopDescription: z.string().optional(),
    shopEmail: z
      .string()
      .trim()
      .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Invalid email address",
      })
      .optional(),
    shopPhone: z.string().optional(),
    shopCategory: z.string().optional(),
    shopAddress: z.string().optional(),
    socialLinks: z
      .object({
        facebook: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        twitter: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // If user is CUSTOMER, skip all shop validation
      if (data.role === "CUSTOMER") {
        return true;
      }

      // For VENDOR, validate required fields
      return (
        !!data.shopName &&
        !!data.shopSlug &&
        !!data.shopEmail &&
        !!data.shopPhone &&
        !!data.shopCategory &&
        !!data.shopAddress
      );
    },
    {
      message: "Required shop information missing",
      path: ["role"], // This sets the error at the role field level
    },
  )
  .superRefine((data, ctx) => {
    // Only add specific field errors if the user is a VENDOR
    if (data.role === "VENDOR") {
      if (!data.shopName) {
        ctx.addIssue({
          path: ["shopName"],
          code: z.ZodIssueCode.custom,
          message: "Shop name is required for vendors",
        });
      }
      if (!data.shopSlug) {
        ctx.addIssue({
          path: ["shopSlug"],
          code: z.ZodIssueCode.custom,
          message: "Shop slug is required for vendors",
        });
      }
      if (!data.shopEmail) {
        ctx.addIssue({
          path: ["shopEmail"],
          code: z.ZodIssueCode.custom,
          message: "Shop email is required for vendors",
        });
      }
      if (!data.shopPhone) {
        ctx.addIssue({
          path: ["shopPhone"],
          code: z.ZodIssueCode.custom,
          message: "Shop phone is required for vendors",
        });
      }
      if (!data.shopCategory) {
        ctx.addIssue({
          path: ["shopCategory"],
          code: z.ZodIssueCode.custom,
          message: "Shop category is required for vendors",
        });
      }
      if (!data.shopAddress) {
        ctx.addIssue({
          path: ["shopAddress"],
          code: z.ZodIssueCode.custom,
          message: "Shop address is required for vendors",
        });
      }
    }
  });

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
