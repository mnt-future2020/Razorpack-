import { Metadata } from "next"
// import { FloatingContact } from "@/components/Rayzor Industrial Packaging Pvt Ltd/FloatingContact"
import { DynamicPageBanner } from "@/components/DynamicPageBanner"
import { PortfolioGrid } from "@/components/Rayzor Industrial Packaging Pvt Ltd/pages/PortfolioGrid"
// import { CTASection } from "@/components/Rayzor Industrial Packaging Pvt Ltd/CTASection"

export const metadata: Metadata = {
  title: "Portfolio | Rayzor Industrial Packaging Pvt Ltd - Our Projects",
  description: "Explore our portfolio of iconic facade projects. From commercial complexes to healthcare facilities, see how we transform buildings with innovative facade solutions.",
}

export default function PortfolioPage() {
  return (
    <main className="min-h-screen"><DynamicPageBanner
        pageKey="portfolio"
        title="Our Portfolio"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Portfolio", href: "/portfolio" },
        ]}
      />
      <PortfolioGrid />
      {/* <CTASection /> */}{/* <FloatingContact /> */}
    </main>
  )
}
