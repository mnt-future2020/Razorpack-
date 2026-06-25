import { Metadata } from "next"
import { getSEO } from "@/lib/get-seo"
import { AboutHeroWrapper } from "@/components/Blufacade/pages/AboutHeroWrapper"
import { AboutBusinessAreas } from "@/components/Blufacade/pages/AboutBusinessAreas"
import { AboutMissionVision } from "@/components/Blufacade/pages/AboutMissionVision"
import { AboutProcess } from "@/components/Blufacade/pages/AboutProcess"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("about")
  return {
    title: seo?.title || "About Us | Rayzor Industrial Packaging Pvt Ltd - Industrial Strength",
    description: seo?.description || "Learn about Rayzor Industrial Packaging Pvt Ltd - your trusted partner for innovative industrial packaging solutions.",
    keywords: seo?.keywords || "",
  }
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white"><AboutHeroWrapper />
      <AboutMissionVision />
      <AboutBusinessAreas />
      <AboutProcess /></main>
  )
}
