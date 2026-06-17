import { Metadata } from "next";
import { Header } from "@/components/Blufacade/Header";
import { HeroSection } from "@/components/Blufacade/HeroSection";
import { CaseStudyStrip } from "@/components/Blufacade/CaseStudyStrip";
import { ProductsCarousel } from "@/components/Blufacade/ProductsCarousel";
import { ServicesSection } from "@/components/Blufacade/ServicesSection";
import { UniqueSection } from "@/components/Blufacade/UniqueSection";
import { MissionSection } from "@/components/Blufacade/MissionSection";
import { TestimonialsSection } from "@/components/Blufacade/TestimonialsSection";
import { ClientLogosSection } from "@/components/Blufacade/ClientLogosSection";
import { FAQSection } from "@/components/Blufacade/FAQSection";
import { Footer } from "@/components/Blufacade/Footer";
import { DemoWrapper } from "@/components/Blufacade/DemoWrapper";
import { Preloader } from "@/components/Blufacade/Preloader";

export const metadata: Metadata = {
  title: "Rayzorpack | Premium Packaging Solutions & LDPE Films",
  description:
    "Rayzor Industrial Packaging Pvt Ltd is the leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags in Madurai, Tamil Nadu. Transform your packaging with our industrial solutions.",
  keywords:
    "packaging solutions, LDPE film rolls, VCI poly bags, stretch films, custom packaging, Madurai, Tamil Nadu, industrial packaging",
  openGraph: {
    title: "Rayzorpack | Premium Packaging Solutions",
    description:
      "Leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags.",
    url: "https://www.rayzorpack.com",
    siteName: "Rayzorpack",
    type: "website",
  },
};

export default function Home() {
  return (
    <DemoWrapper>
      <Preloader />
      <main className="relative w-full overflow-x-hidden">
        <Header />
        {/* No top padding — hero goes under the navbar so transparent logo area shows hero behind it */}
        <HeroSection />
        {/* About Section - Scroll animation */}
        <UniqueSection />
        {/* <CaseStudyStrip /> */}
        <ServicesSection />

        {/* Products — light cream bg */}
        <ProductsCarousel />
        {/* Why Choose Us — white bg */}
        <MissionSection />
        {/* Footer — Parallax Reveal */}
        <Footer />
      </main>
    </DemoWrapper>
  );
}
