import { Metadata } from "next";
import { HeroSection } from "@/components/Blufacade/HeroSection";
import { ProductsCarousel } from "@/components/Blufacade/ProductsCarousel";
import { ServicesSection } from "@/components/Blufacade/ServicesSection";
import { UniqueSection } from "@/components/Blufacade/UniqueSection";
import { MissionSection } from "@/components/Blufacade/MissionSection";
import { getSEO } from "@/lib/get-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("home");
  return {
    title: seo?.title || "Rayzor Industrial Packaging Pvt Ltd | Premium Packaging Solutions & LDPE Films",
    description: seo?.description || "Rayzor Industrial Packaging Pvt Ltd is the leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags in Madurai, Tamil Nadu.",
    keywords: seo?.keywords || "packaging solutions, LDPE film rolls, VCI poly bags, stretch films, custom packaging, Madurai, Tamil Nadu",
    openGraph: {
      title: seo?.title || "Rayzor Industrial Packaging Pvt Ltd | Premium Packaging Solutions",
      description: seo?.description || "Leading manufacturer of premium packaging materials, LDPE Film Rolls, and Poly Bags.",
      url: "https://www.rayzorpack.com",
      siteName: "Rayzor Industrial Packaging Pvt Ltd",
      type: "website",
    },
  };
}

export default function Home() {
  return (
    <>
      <main className="relative w-full overflow-x-hidden">
        <HeroSection />
        <UniqueSection />
        <ServicesSection />
        <ProductsCarousel />
        <MissionSection />
      </main>
    </>
  );
}
