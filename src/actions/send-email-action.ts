import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { type SendEmailInput, sendEmail } from '@/lib/send-email';

const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  meta: z.object({
    description: z.string(),
    link: z.string().url(),
    callToActionText: z.string(),
    greeting: z.string().optional(),
  }),
});

export type { SendEmailInput };

export const sendEmailAction = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => SendEmailSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await sendEmail(data);
      return { success: true };
      // biome-ignore lint/suspicious/noExplicitAny: this is fine
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
