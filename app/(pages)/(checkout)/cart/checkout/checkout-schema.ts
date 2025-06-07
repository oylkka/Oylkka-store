import { z } from 'zod';

export const addressSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  address: z
    .string()
    .min(5, { message: 'Address must be at least 5 characters' }),
  apartment: z.string().optional(),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }),
  district: z.string().min(2, { message: 'Please select a state/province' }),
  postalCode: z
    .string()
    .min(3, { message: 'Please enter a valid postal code' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
});

export const paymentSchema = z.object({
  method: z.enum(['bkash', 'nagad', 'cod']),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
