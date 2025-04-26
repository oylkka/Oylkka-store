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
        token.id = user.id;
        token.role = user.role;
        token.hasOnboarded = user.hasOnboarded;
        token.username = user.username;
      }

      // Handle session update (e.g., after onboarding)
      if (trigger === 'update' && session) {
        // Update name and image if provided
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
        if (session.phone) {
          token.phone = session.phone;
        }
        if (session.email) {
          token.email = session.email;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role as string;
      session.user.hasOnboarded = token.hasOnboarded as boolean;
      session.user.username = token.username as string;
      session.user.phone = token.phone as string;

      // Make sure name and image are properly set
      session.user.name = token.name;
      session.user.image = token.picture;

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;
