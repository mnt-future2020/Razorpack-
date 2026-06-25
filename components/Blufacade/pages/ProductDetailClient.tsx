"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { QuoteModal } from "@/components/Blufacade/QuoteModal";
import { ChevronDown, Check, ArrowRight, Phone } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ProductData {
  productName: string;
  category?: string;
  description: string;
  shortDescription?: string;
  image: string;
  gallery?: string[];
  features: string[];
  technicalSpecs?: Array<{ label: string; value: string }>;
  applications?: string[];
  tags?: string[];
  deliveryInfo?: string[];
  slug: string;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="pdt-border border-t border-[#e8e8e8]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="pdt-accordion-title text-[var(--brand-dark)] font-semibold text-sm tracking-wide">
          {title}
        </span>
        <ChevronDown
          className={`pdt-chevron w-4 h-4 text-[#999] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[500px] pb-6" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function ProductDetailClient({ product }: { product: ProductData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quoteOpen, setQuoteOpen] = useState(false);

  // ── Background color transition: white → dark on scroll ──
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "top 20%",
          scrub: 1,
        },
      });

      tl.fromTo(section, { backgroundColor: "#ffffff" }, { backgroundColor: "#0f1117", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-heading"), { color: "var(--brand-dark)" }, { color: "#ffffff", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-label"), { color: "var(--brand-blue)" }, { color: "var(--brand-blue)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-desc"), { color: "#666666" }, { color: "rgba(255,255,255,0.6)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-pill"), { backgroundColor: "#f5f5f5", color: "var(--brand-dark)" }, { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-pill-accent"), { backgroundColor: "rgba(38,168,224,0.1)", color: "var(--brand-blue)" }, { backgroundColor: "rgba(38,168,224,0.15)", color: "var(--brand-blue)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-border"), { borderColor: "#e8e8e8" }, { borderColor: "rgba(255,255,255,0.1)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-accordion-title"), { color: "var(--brand-dark)" }, { color: "#ffffff", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-text"), { color: "#555555" }, { color: "rgba(255,255,255,0.6)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-img-bg"), { backgroundColor: "#ffffff", borderColor: "#f0f0f0", boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)" }, { backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 20px 40px -15px rgba(38, 168, 224, 0.12)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-chevron"), { color: "#999999" }, { color: "rgba(255,255,255,0.4)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-btn-primary"), { backgroundColor: "#1b1c19", color: "#ffffff" }, { backgroundColor: "#26A8E0", color: "#ffffff", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-btn-secondary"), { backgroundColor: "#ffffff", color: "#1b1c19", borderColor: "#e0e0e0" }, { backgroundColor: "rgba(255, 255, 255, 0.05)", color: "#ffffff", borderColor: "rgba(255,255,255,0.15)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-check-bg"), { backgroundColor: "rgba(38, 168, 224, 0.1)" }, { backgroundColor: "rgba(38, 168, 224, 0.2)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-check-green-bg"), { backgroundColor: "#dcfce7" }, { backgroundColor: "rgba(34, 197, 94, 0.15)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".pdt-check-green-icon"), { color: "#16a34a" }, { color: "#4ade80", ease: "none" }, 0);
    },
    { scope: sectionRef }
  );

  // Build images array: main image + gallery
  const allImages = [
    product.image,
    ...(product.gallery || []),
  ].filter(Boolean);

  // Ensure at least 1 image
  if (allImages.length === 0) {
    allImages.push("/images/placeholder.svg");
  }

  const features = product.features?.length > 0
    ? product.features
    : [
        "Industrial-grade material quality",
        "Custom sizes available on request",
        "Excellent tensile strength & durability",
        "Suitable for export packaging",
        "Moisture & corrosion resistant",
      ];

  const applications = (product.applications && product.applications.length > 0)
    ? product.applications
    : [
        "Automotive Industry",
        "Electronics & Electrical",
        "Heavy Machinery",
        "Aerospace & Defense",
        "Export & Shipping",
        "Warehousing & Storage",
      ];

  return (
    <section ref={sectionRef} className="bg-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-16 xl:px-20 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-20 items-start">

          {/* ═══════════════════════════════
              LEFT — Image Gallery (sticky)
              Main image + thumbnail grid
          ═══════════════════════════════ */}
          <div className="space-y-3 lg:sticky lg:top-24">
            {/* Main Image */}
            <div className="pdt-img-bg relative w-full aspect-[4/3] bg-white rounded-lg overflow-hidden border border-[#f0f0f0]">
              <Image
                src={allImages[selectedImage]}
                alt={product.productName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Thumbnail Grid — 2x2 or row */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {allImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square bg-white rounded-md overflow-hidden border transition-all duration-300 ${
                      selectedImage === idx
                        ? "ring-2 ring-[var(--brand-blue)] border-transparent scale-[0.98]"
                        : "border-[#f0f0f0] hover:scale-102 hover:opacity-90"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.productName} ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Extra gallery images — row below */}
            {allImages.length > 4 && (
              <div className="grid grid-cols-4 gap-2.5">
                {allImages.slice(4, 8).map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setSelectedImage(idx + 4)}
                    className={`relative aspect-square bg-white rounded-md overflow-hidden border transition-all duration-300 ${
                      selectedImage === idx + 4
                        ? "ring-2 ring-[var(--brand-blue)] border-transparent scale-[0.98]"
                        : "border-[#f0f0f0] hover:scale-102 hover:opacity-90"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.productName} ${idx + 5}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════
              RIGHT — Product Info
              Name, category, desc, accordions, CTA
          ═══════════════════════════════ */}
          <div className="flex flex-col">
            {/* Category badge */}
            <span className="pdt-label text-[var(--brand-blue)] text-[11px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)] animate-pulse" />
              {product.category || "Industrial Packaging"}
            </span>

            {/* Product Name */}
            <h1 className="pdt-heading font-heading font-extrabold text-[var(--brand-dark)] text-2xl md:text-3xl lg:text-[2.1rem] xl:text-4xl tracking-tight leading-[1.15] mb-5">
              {product.productName}
            </h1>

            {/* Quick specs pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(product.tags && product.tags.length > 0
                ? product.tags
                : ["Made in India", "Custom Sizes"]
              ).map((tag) => (
                <span key={`tag-${tag}`} className="pdt-pill px-3 py-1.5 bg-[#f5f5f5] text-[var(--brand-dark)] text-[11px] font-semibold rounded-full uppercase tracking-wider">
                  {tag}
                </span>
              ))}
              <span className="pdt-pill-accent px-3 py-1.5 bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] text-[11px] font-semibold rounded-full uppercase tracking-wider">
                {product.category || "Premium Quality"}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 mb-8">
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="pdt-btn-primary flex items-center justify-center gap-2 w-full bg-[#1b1c19] text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
              >
                Request a Quote
              </button>
              <a
                href="tel:+919087787879"
                className="pdt-btn-secondary flex items-center justify-center gap-2 w-full bg-white text-[#1b1c19] py-4 rounded-lg font-bold text-sm uppercase tracking-wider border border-[#e0e0e0] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                Call: +91 90877 87879
              </a>
            </div>

            {/* Description — strip HTML for clean display */}
            <p className="pdt-desc text-[#666] text-sm md:text-[15px] leading-[1.8] mb-6">
              {product.description.replace(/<[^>]+>/g, "")}
            </p>

            {/* ─── Accordion Sections ─── */}

            {/* Key Features */}
            <AccordionItem title="Key Features" defaultOpen>
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={`feature-${feature}`} className="flex items-start gap-3">
                    <div className="pdt-check-bg w-5 h-5 rounded-full bg-[var(--brand-blue)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[var(--brand-blue)]" />
                    </div>
                    <span className="pdt-text text-[#555] text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* Technical Specifications */}
            {product.technicalSpecs && product.technicalSpecs.length > 0 && (
              <AccordionItem title="Technical Specifications">
                <div className="space-y-0">
                  {product.technicalSpecs.map((spec, idx) => (
                    <div
                      key={`spec-${spec.label}`}
                      className={`flex justify-between items-center py-3 ${
                        idx !== product.technicalSpecs!.length - 1
                          ? "border-b border-[#f0f0f0]"
                          : ""
                      }`}
                    >
                      <span className="pdt-accordion-title text-[#333] text-sm font-medium">{spec.label}</span>
                      <span className="pdt-text text-[#888] text-sm">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            )}

            {/* Applications & Sectors */}
            <AccordionItem title="Applications & Sectors">
              <div className="flex flex-wrap gap-2">
                {applications.map((app, idx) => (
                  <span
                    key={`app-${app}`}
                    className="pdt-pill px-4 py-2 bg-[#f5f5f5] text-[#555] text-xs font-medium rounded-full"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </AccordionItem>

            {/* Delivery & Packaging */}
            <AccordionItem title="Delivery & Packaging">
              <div className="space-y-3">
                {(product.deliveryInfo && product.deliveryInfo.length > 0
                  ? product.deliveryInfo
                  : [
                      "Pan-India delivery with 99% on-schedule rate",
                      "International export packaging available",
                      "Bulk order discounts for recurring clients",
                    ]
                ).map((info) => (
                  <div key={`delivery-${info}`} className="flex items-start gap-3">
                    <div className="pdt-check-green-bg w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="pdt-check-green-icon w-3 h-3 text-green-600" />
                    </div>
                    <span className="pdt-text text-[#555] text-sm leading-relaxed">
                      {info}
                    </span>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* Bottom border */}
            <div className="pdt-border border-t border-[#e8e8e8]" />
          </div>
        </div>
      </div>
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} productOrService={product.productName} />
    </section>
  );
}
