import { SessionProvider } from "next-auth/react";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SessionProvider>
        <Header />
        {children}
        <Footer />
      </SessionProvider>
    </>
  );
}
