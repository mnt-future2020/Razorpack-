import { TopBar } from "@/components/top-bar";
import { DynamicPageBanner } from "@/components/DynamicPageBanner";
import { CtaBanner } from "@/components/cta-banner";
import { SupportModelSeo } from "@/components/SupportModel/SupportModelSeo";
import { SupportModelContent } from "@/components/SupportModel/SupportModelContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Support Model | Rayzor Industrial Packaging Pvt Ltd",
  description:
    "Discover our person-centered support models designed to empower individuals with disabilities to achieve their goals.",
  keywords:
    "NDIS support model, person-centered care, disability support, empowerment, collaborative support",
};

export default function SupportModelPage() {
  return (
    <main className="min-h-screen">
      <SupportModelSeo />
      <TopBar /><DynamicPageBanner
        pageKey="support-model"
        title="OUR SUPPORT MODEL"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Support Model", href: "/support-model" },
        ]}
      />
      <SupportModelContent />
      <CtaBanner /></main>
  );
}
