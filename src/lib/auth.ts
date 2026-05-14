import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { DeleteImage } from '@/cloudinary';
import { sendEmail } from '@/lib/send-email';
import { prisma } from './db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Merge Social Providers
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || '',
  ],

  // Combined Database Hooks
  databaseHooks: {
    user: {
      // 1. Logic for handling image cleanup and parsing before an update
      update: {
        before: async (data, ctx) => {
          if (typeof data.image === 'string' && data.image.includes('|')) {
            const [imageUrl, imageId] = data.image.split('|');
            data.image = imageUrl;
            data.imageId = imageId;
          }

          if (data.image || data.imageId) {
            if (ctx?.context?.session) {
              const session = ctx.context.session;
              if (session?.user?.userId) {
                const user = await prisma.user.findUnique({
                  where: { id: session.user.userId },
                  select: { imageId: true },
                });

                if (user?.imageId) {
                  DeleteImage(user.imageId).catch((err) => {
                    // biome-ignore lint/suspicious/noConsole: this is fine
                    console.error('Failed to delete old profile image', err);
                  });
                }
              }
            }
          }
          return { data };
        },
      },
      // 2. Logic for subscriber backfilling after a new user creation
      create: {
        after: async (user) => {
          await prisma.subscriber.upsert({
            where: { email: user.email },
            update: {
              name: user.name ?? undefined,
              status: 'ACTIVE',
            },
            create: {
              email: user.email,
              name: user.name ?? undefined,
              source: 'google_signup',
              status: 'ACTIVE',
            },
          });
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 6,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        meta: {
          description:
            'You requested a password reset. Click below to continue.',
          link: url,
          callToActionText: 'Reset Password',
        },
      });
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    expiresIn: 3600, // 1 hour
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set('callbackURL', '/auth/verify');
      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        meta: {
          description: 'Please verify your email to activate your account.',
          link: String(link),
          callToActionText: 'Verify Email Address',
        },
      });
    },
  },

  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
  },

  plugins: [
    admin({
      defaultRole: 'USER',
      adminRoles: ['ADMIN'],
    }),
    tanstackStartCookies(),
  ],
});
