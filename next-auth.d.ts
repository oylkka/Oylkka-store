import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    hasOnboarded?: boolean;
    username?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      hasOnboarded?: boolean;
      username?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    hasOnboarded?: boolean;
    username?: string;
  }
}
