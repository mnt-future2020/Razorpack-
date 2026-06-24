"use client";

import { PageHero } from "./PageHero";
import { useBanner } from "@/hooks/use-banner";

const FALLBACK = {
  label: "Our Products",
  headingLine1: "PACKAGING",
  headingLine2: "PROTECTION",
  description:
    "Precision-engineered VCI & LDPE films, pouches, bags, and shrink wraps — delivering industrial-grade corrosion prevention and product protection across 16+ specialized solutions.",
  image: "/images/products_hero_packaging_v2.png",
};

export function ProductsHero() {
  const { banner } = useBanner("products");

  return (
    <PageHero
      label={banner?.label || FALLBACK.label}
      headingLine1={banner?.headingLine1 || FALLBACK.headingLine1}
      headingLine2={banner?.headingLine2 || FALLBACK.headingLine2}
      description={banner?.description || FALLBACK.description}
      image={banner?.image || FALLBACK.image}
      imageAlt="Rayzor Industrial Packaging Pvt Ltd VCI & LDPE Packaging Products"
      showPlayButton={false}
      bgGraphicTopRight="/images/rayzor/hero/hero_products_bg_tr.png"
      bgGraphicBottomLeft="/images/rayzor/hero/hero_products_bg_bl.png"
    />
  );
}
