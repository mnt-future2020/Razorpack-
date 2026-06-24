"use client";

import { PageHero } from "./PageHero";
import { useBanner } from "@/hooks/use-banner";

const FALLBACK = {
  label: "Get In Touch",
  headingLine1: "CONTACT",
  headingLine2: "US",
  description:
    "Reach out to our team in Madurai, Tamil Nadu for packaging consultations, bulk enquiries, or custom solutions — we respond within 24 hours.",
  image: "/images/rayzor/contact-hero.png",
};

export function ContactHero() {
  const { banner } = useBanner("contact");

  return (
    <PageHero
      label={banner?.label || FALLBACK.label}
      headingLine1={banner?.headingLine1 || FALLBACK.headingLine1}
      headingLine2={banner?.headingLine2 || FALLBACK.headingLine2}
      description={banner?.description || FALLBACK.description}
      image={banner?.image || FALLBACK.image}
      imageAlt="Rayzor Industrial Packaging Pvt Ltd Contact — Madurai Facility"
    />
  );
}
