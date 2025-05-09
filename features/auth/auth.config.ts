import { PrismaClient } from '@/prisma/output';
import type { NextAuthConfig } from 'next-auth';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

// Initialize Prisma client for username uniqueness check
const prisma = new PrismaClient();

// Helper function to generate a unique username suffix
function generateRandomSuffix() {
  return Math.floor(Math.random() * 10000).toString();
}

// Helper function to check if a username already exists
async function usernameExists(username: string): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });
  return !!existingUser;
}

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // Add a profile function to provide a username
      profile: async (profile) => {
        // Create a base username from email
        let baseUsername = profile.email?.split('@')[0] || 'user';

        // Remove non-alphanumeric characters
        baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Ensure minimum length
        if (baseUsername.length < 3) {
          baseUsername = `user${generateRandomSuffix()}`;
        }

        // Check if the username exists and generate a unique one if needed
        let username = baseUsername;
        let usernameIsUnique = false;
        let attempts = 0;

        while (!usernameIsUnique && attempts < 5) {
          // Check if username exists
          const exists = await usernameExists(username);

          if (!exists) {
            usernameIsUnique = true;
          } else {
            // If exists, add a random suffix
            username = `${baseUsername}${generateRandomSuffix()}`;
            attempts++;
          }
        }

        // Return the profile with the unique username
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: username,
        };
      },
    }),
    Github({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      // Similar profile function for GitHub
      profile: async (profile) => {
        // Create a base username from GitHub login
        let baseUsername = profile.login || profile.name || 'user';

        // Remove non-alphanumeric characters
        baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Ensure minimum length
        if (baseUsername.length < 3) {
          baseUsername = `user${generateRandomSuffix()}`;
        }

        // Check if the username exists and generate a unique one if needed
        let username = baseUsername;
        let usernameIsUnique = false;
        let attempts = 0;

        while (!usernameIsUnique && attempts < 5) {
          // Check if username exists
          const exists = await usernameExists(username);

          if (!exists) {
            usernameIsUnique = true;
          } else {
            // If exists, add a random suffix
            username = `${baseUsername}${generateRandomSuffix()}`;
            attempts++;
          }
        }

        // Return the profile with the unique username
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: username,
        };
      },
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
