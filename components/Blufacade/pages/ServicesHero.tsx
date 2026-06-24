"use client";

import { PageHero } from "./PageHero";
import { useBanner } from "@/hooks/use-banner";

const FALLBACK = {
  label: "Our Services",
  headingLine1: "SOLUTIONS",
  headingLine2: "SECTORS",
  description:
    "From contract packaging and export palletization to vacuum sealing and VCI protection — we deliver end-to-end industrial packaging services engineered for global supply chains.",
  image: "/images/rayzor/services/services_hero_premium.png",
};

export function ServicesHero() {
  const { banner } = useBanner("services");

  return (
    <PageHero
      label={banner?.label || FALLBACK.label}
      headingLine1={banner?.headingLine1 || FALLBACK.headingLine1}
      headingLine2={banner?.headingLine2 || FALLBACK.headingLine2}
      description={banner?.description || FALLBACK.description}
      image={banner?.image || FALLBACK.image}
      imageAlt="Rayzor Industrial Packaging Pvt Ltd Services"
      bgGraphicTopRight="/images/rayzor/hero/hero_services_bg_tr.png"
      bgGraphicBottomLeft="/images/rayzor/hero/hero_services_bg_bl.png"
    />
  );
}
