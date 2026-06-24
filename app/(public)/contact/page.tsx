import { Metadata } from "next"
import { ContactHero } from "@/components/Blufacade/pages/ContactHero"
import { ContactContent } from "@/components/Blufacade/pages/ContactContent"

export const metadata: Metadata = {
  title: "Contact Us | Rayzor Industrial Packaging Pvt Ltd - Get In Touch",
  description: "Contact Rayzor Industrial Packaging Pvt Ltd for packaging consultations, bulk enquiries, or custom solutions. Visit our facility in Madurai, Tamil Nadu.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen"><ContactHero />
      <ContactContent /></main>
  )
}
