import { Metadata } from "next"
import { getSEO } from "@/lib/get-seo"
import { ContactHero } from "@/components/Blufacade/pages/ContactHero"
import { ContactContent } from "@/components/Blufacade/pages/ContactContent"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("contact")
  return {
    title: seo?.title || "Contact Us | Rayzor Industrial Packaging Pvt Ltd - Get In Touch",
    description: seo?.description || "Contact Rayzor Industrial Packaging Pvt Ltd for packaging consultations, bulk enquiries, or custom solutions. Visit our facility in Madurai, Tamil Nadu.",
    keywords: seo?.keywords || "",
  }
}

export default function ContactPage() {
  return (
    <main className="min-h-screen"><ContactHero />
      <ContactContent /></main>
  )
}
