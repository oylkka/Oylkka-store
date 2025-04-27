import { PrismaClient } from "@/prisma/output";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const prisma = new PrismaClient();

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
});
