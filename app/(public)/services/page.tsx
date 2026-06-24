import { Metadata } from "next"
import { ServicesHero } from "@/components/Blufacade/pages/ServicesHero"
import { ServicesGrid } from "@/components/Blufacade/pages/ServicesGrid"

export const metadata: Metadata = {
  title: "Our Services | Rayzor Industrial Packaging Pvt Ltd - Industrial Packaging Solutions",
  description: "Explore our comprehensive industrial packaging services including contract packaging, export palletization, vacuum packaging, and VCI protection.",
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen"><ServicesHero />
      <ServicesGrid /></main>
  )
}
