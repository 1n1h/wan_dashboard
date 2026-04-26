import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { UseCases } from "@/components/landing/UseCases";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { AffiliateSection } from "@/components/landing/AffiliateSection";
import { RefTracker } from "@/components/landing/RefTracker";

export default function HomePage() {
  return (
    <>
      <RefTracker />
      <Nav />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <UseCases />
        <AffiliateSection />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
