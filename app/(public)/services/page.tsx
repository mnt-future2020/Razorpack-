import { Metadata } from "next"
import { getSEO } from "@/lib/get-seo"
import { ServicesHero } from "@/components/Blufacade/pages/ServicesHero"
import { ServicesGrid } from "@/components/Blufacade/pages/ServicesGrid"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("services")
  return {
    title: seo?.title || "Our Services | Rayzor Industrial Packaging Pvt Ltd - Industrial Packaging Solutions",
    description: seo?.description || "Explore our comprehensive industrial packaging services including contract packaging, export palletization, vacuum packaging, and VCI protection.",
    keywords: seo?.keywords || "",
  }
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen"><ServicesHero />
      <ServicesGrid /></main>
  )
}
