"use client";

import { PageHero } from "./PageHero";
import { useBanner } from "@/hooks/use-banner";

const FALLBACK = {
  label: "About Us",
  headingLine1: "ELEVATING",
  headingLine2: "PACKAGING",
  description:
    "For over two decades, we've been the driving force behind tailor-made packaging solutions. Our production hub in Madurai, Tamil Nadu stands as a testament to our commitment to precision and quality.",
  image: "/images/about_hero_packaging.png",
};

export function AboutHeroWrapper() {
  const { banner } = useBanner("about");

  return (
    <PageHero
      label={banner?.label || FALLBACK.label}
      headingLine1={banner?.headingLine1 || FALLBACK.headingLine1}
      headingLine2={banner?.headingLine2 || FALLBACK.headingLine2}
      description={banner?.description || FALLBACK.description}
      image={banner?.image || FALLBACK.image}
      imageAlt="Rayzor Industrial Packaging Pvt Ltd — About Us"
    />
  );
}
