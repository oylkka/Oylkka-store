import React from "react";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

import HeroSection from "./hero";

export default function page() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
