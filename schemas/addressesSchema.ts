import { z } from 'zod';

export const addressSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  city: z.string().min(2, {
    message: 'City must be at least 2 characters.',
  }),
  district: z.string().min(2, {
    message: 'District must be at least 2 characters.',
  }),
  postalCode: z.string().min(4, {
    message: 'Postal code must be at least 4 characters.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const editAddressSchema = addressSchema.extend({
  id: z.string().min(1, { message: 'Address ID is required.' }),
});

export type EditAddressFormValues = z.infer<typeof editAddressSchema>;
