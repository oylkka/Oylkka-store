import type { NextAuthConfig } from 'next-auth';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Github({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        // Safely add properties to token, checking if they exist first
        token.id = user.id;
        token.role = user.role || 'CUSTOMER'; // Default if not available
        token.hasOnboarded =
          typeof user.hasOnboarded === 'boolean' ? user.hasOnboarded : false;
        token.username = user.username || null;
      }

      // Handle session update (e.g., after onboarding)
      if (trigger === 'update' && session) {
        // Update properties if provided
        if (session.name) {
          token.name = session.name;
        }
        if (session.image) {
          token.picture = session.image;
        }
        if (session.hasOnboarded !== undefined) {
          token.hasOnboarded = session.hasOnboarded;
        }
        if (session.role) {
          token.role = session.role;
        }
        if (session.username) {
          token.username = session.username;
        }
        if (session.email) {
          token.email = session.email;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) {
        session.user = {};
      }

      // Ensure all properties exist before assigning them
      session.user.id = token.id as string;
      session.user.role = (token.role as string) || 'CUSTOMER';
      session.user.hasOnboarded = (token.hasOnboarded as boolean) || false;
      session.user.username = (token.username as string) || null;

      // Make sure name and image are properly set
      session.user.name = token.name || null;
      session.user.image = token.picture || null;

      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    updateAge: 24 * 60 * 60, // 24 hours
  },
} satisfies NextAuthConfig;
