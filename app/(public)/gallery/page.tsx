import { Metadata } from "next";
import { getSEO } from "@/lib/get-seo";
import { GalleryHero } from "@/components/Blufacade/pages/GalleryHero";
import { OurWorksSection } from "@/components/Blufacade/pages/OurWorksSection";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("gallery");
  return {
    title: seo?.title || "Project Gallery & Portfolio | Rayzor Industrial Packaging Pvt Ltd",
    description: seo?.description || "Explore our gallery of completed packaging projects. From custom LDPE films to advanced VCI corrosion protection solutions, see how we safeguard industrial shipments.",
    keywords: seo?.keywords || "",
  };
}

export default function PortfolioPage() {
  return (
    <main className="min-h-screen">
      <GalleryHero />
      <OurWorksSection />
    </main>
  );
}
