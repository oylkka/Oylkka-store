import { redirect } from "next/navigation";

import { auth } from "@/features/auth/auth";

import SignIn from "./sign-in";

export default async function SignInPage() {
  const session = await auth();

  // Redirect to dashboard if user is authenticated
  if (session?.user) {
    redirect("/dashboard");
  }

  // Render client component for unauthenticated users
  return <SignIn />;
}
