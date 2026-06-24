import { Metadata } from "next"
import { AboutHero } from "@/components/Blufacade/pages/AboutHero"
import { AboutBusinessAreas } from "@/components/Blufacade/pages/AboutBusinessAreas"
import { AboutMissionVision } from "@/components/Blufacade/pages/AboutMissionVision"
import { AboutProcess } from "@/components/Blufacade/pages/AboutProcess"

export const metadata: Metadata = {
  title: "About Us | Rayzor Industrial Packaging Pvt Ltd - Industrial Strength",
  description: "Learn about Rayzor Industrial Packaging Pvt Ltd - your trusted partner for innovative industrial packaging solutions.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white"><AboutHero />
      <AboutMissionVision />
      <AboutBusinessAreas />
      <AboutProcess /></main>
  )
}
