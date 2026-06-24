"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Check, Phone, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ServiceData {
  _id?: string;
  serviceName: string;
  shortDescription?: string;
  description: string;
  image: string;
  gallery?: string[];
  features: string[];
  slug: string;
  status?: string;
  category?: string;
  applications?: string[];
  technicalSpecs?: { label: string; value: string }[];
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="sdt-border border-t border-[#e8e8e8]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="sdt-accordion-title text-[var(--brand-dark)] font-semibold text-sm tracking-wide">
          {title}
        </span>
        <ChevronDown
          className={`sdt-chevron w-4 h-4 text-[#999] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[600px] pb-6" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function ServiceDetailContent({ serviceData }: { serviceData: ServiceData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState(0);

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
      tl.fromTo(section.querySelectorAll(".sdt-heading"), { color: "var(--brand-dark)" }, { color: "#ffffff", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-desc"), { color: "#666666" }, { color: "rgba(255,255,255,0.6)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-pill"), { backgroundColor: "#f5f5f5", color: "var(--brand-dark)" }, { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-pill-accent"), { backgroundColor: "rgba(38,168,224,0.1)", color: "var(--brand-blue)" }, { backgroundColor: "rgba(38,168,224,0.15)", color: "var(--brand-blue)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-border"), { borderColor: "#e8e8e8" }, { borderColor: "rgba(255,255,255,0.1)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-accordion-title"), { color: "var(--brand-dark)" }, { color: "#ffffff", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-text"), { color: "#555555" }, { color: "rgba(255,255,255,0.6)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-img-bg"), { borderColor: "#f0f0f0" }, { borderColor: "rgba(255,255,255,0.08)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-chevron"), { color: "#999999" }, { color: "rgba(255,255,255,0.4)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-step-num"), { color: "var(--brand-blue)" }, { color: "var(--brand-blue)", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-step-title"), { color: "var(--brand-dark)" }, { color: "#ffffff", ease: "none" }, 0);
      tl.fromTo(section.querySelectorAll(".sdt-step-desc"), { color: "#888888" }, { color: "rgba(255,255,255,0.4)", ease: "none" }, 0);
    },
    { scope: sectionRef }
  );

  const allImages = [
    serviceData.image,
    ...(serviceData.gallery || []),
  ].filter(Boolean);

  if (allImages.length === 0) {
    allImages.push("/images/placeholder.svg");
  }

  const features = serviceData.features?.length > 0
    ? serviceData.features
    : [
        "End-to-end packaging solutions",
        "In-house manufacturing & quality control",
        "Custom specifications to match your needs",
        "Dedicated project coordination team",
        "Pan-India & international service coverage",
      ];

  const applications = serviceData.applications?.length > 0
    ? serviceData.applications
    : [
        "Automotive Industry",
        "Electronics & Electrical",
        "Heavy Machinery",
        "Aerospace & Defense",
        "Export & Shipping",
        "Warehousing & Storage",
      ];

  // Strip HTML from description for plain text display
  const plainDescription = serviceData.description.replace(/<[^>]+>/g, "");

  return (
    <section ref={sectionRef} className="bg-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-16 xl:px-20 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-20 items-start">

          {/* ═══════════════════════════════
              LEFT — Image Gallery (sticky)
          ═══════════════════════════════ */}
          <div className="space-y-3 lg:sticky lg:top-24">
            {/* Main Image */}
            <div className="sdt-img-bg relative w-full aspect-[4/3] bg-white rounded-lg overflow-hidden border border-[#f0f0f0]">
              <Image
                src={allImages[selectedImage]}
                alt={serviceData.serviceName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {allImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square bg-white rounded-md overflow-hidden border transition-all duration-200 ${
                      selectedImage === idx
                        ? "ring-2 ring-[var(--brand-blue)] ring-offset-2 border-transparent"
                        : "border-[#f0f0f0] hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${serviceData.serviceName} ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </button>
                ))}
              </div>
            )}

            {allImages.length > 4 && (
              <div className="grid grid-cols-4 gap-2.5">
                {allImages.slice(4, 8).map((img, idx) => (
                  <button
                    key={idx + 4}
                    onClick={() => setSelectedImage(idx + 4)}
                    className={`relative aspect-square bg-white rounded-md overflow-hidden border transition-all duration-200 ${
                      selectedImage === idx + 4
                        ? "ring-2 ring-[var(--brand-blue)] ring-offset-2 border-transparent"
                        : "border-[#f0f0f0] hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${serviceData.serviceName} ${idx + 5}`}
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
              RIGHT — Service Info
          ═══════════════════════════════ */}
          <div className="flex flex-col">
            {/* Category badge */}
            <span className="sdt-label text-[var(--brand-blue)] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              {serviceData.category || "Packaging Service"}
            </span>

            {/* Service Name */}
            <h1 className="sdt-heading font-heading font-extrabold text-[var(--brand-dark)] text-2xl md:text-3xl lg:text-[2.1rem] xl:text-4xl tracking-tight leading-[1.15] mb-5">
              {serviceData.serviceName}
            </h1>

            {/* Quick info pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="sdt-pill px-3 py-1.5 bg-[#f5f5f5] text-[var(--brand-dark)] text-[11px] font-semibold rounded-full uppercase tracking-wider">
                In-House Production
              </span>
              <span className="sdt-pill px-3 py-1.5 bg-[#f5f5f5] text-[var(--brand-dark)] text-[11px] font-semibold rounded-full uppercase tracking-wider">
                Pan-India Delivery
              </span>
              <span className="sdt-pill-accent px-3 py-1.5 bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] text-[11px] font-semibold rounded-full uppercase tracking-wider">
                {serviceData.category || "Premium Service"}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 mb-8">
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full bg-[var(--brand-dark)] text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#333] transition-colors"
              >
                Get a Free Consultation
              </Link>
              <a
                href="tel:+919087787879"
                className="flex items-center justify-center gap-2 w-full bg-white text-[var(--brand-dark)] py-4 rounded-lg font-bold text-sm uppercase tracking-wider border border-[#e0e0e0] hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call: +91 90877 87879
              </a>
            </div>

            {/* Description */}
            <p className="sdt-desc text-[#666] text-sm md:text-[15px] leading-[1.8] mb-6">
              {plainDescription}
            </p>

            {/* ─── Accordion Sections ─── */}

            {/* Key Features */}
            <AccordionItem title="Key Features" defaultOpen>
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--brand-blue)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[var(--brand-blue)]" />
                    </div>
                    <span className="sdt-text text-[#555] text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* Technical Specifications */}
            {serviceData.technicalSpecs && serviceData.technicalSpecs.length > 0 && (
              <AccordionItem title="Technical Specifications">
                <div className="space-y-0">
                  {serviceData.technicalSpecs.map((spec, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center py-3 ${
                        idx !== serviceData.technicalSpecs!.length - 1
                          ? "border-b border-[#f0f0f0]"
                          : ""
                      }`}
                    >
                      <span className="sdt-accordion-title text-[#333] text-sm font-medium">{spec.label}</span>
                      <span className="sdt-text text-[#888] text-sm">{spec.value}</span>
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
                    key={idx}
                    className="sdt-pill px-4 py-2 bg-[#f5f5f5] text-[#555] text-xs font-medium rounded-full"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </AccordionItem>

            {/* Our Process */}
            <AccordionItem title="Our Process">
              <div className="space-y-4">
                {[
                  { step: "01", title: "Consultation", desc: "We analyze your requirements and recommend the optimal packaging solution." },
                  { step: "02", title: "Material Selection", desc: "Our experts choose the right polymer grade and specifications for your application." },
                  { step: "03", title: "Execution", desc: "In-house manufacturing with strict quality control at every stage." },
                  { step: "04", title: "Delivery", desc: "On-time dispatch with 99% on-schedule delivery across India and internationally." },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <span className="sdt-step-num text-[var(--brand-blue)] font-heading font-bold text-lg flex-shrink-0 w-8">
                      {item.step}
                    </span>
                    <div>
                      <span className="sdt-step-title text-[var(--brand-dark)] font-semibold text-sm block mb-0.5">{item.title}</span>
                      <span className="sdt-step-desc text-[#888] text-xs leading-relaxed">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* Why Choose Us */}
            <AccordionItem title="Why Choose Us">
              <div className="space-y-3">
                {[
                  "20+ years of industrial packaging expertise",
                  "In-house production hub in Madurai, Tamil Nadu",
                  "Strict quality standards & certifications",
                  "Custom solutions tailored to your supply chain",
                  "Pan-India delivery with 99% on-time rate",
                  "Dedicated project coordination team",
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="sdt-text text-[#555] text-sm leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* Bottom border */}
            <div className="sdt-border border-t border-[#e8e8e8]" />
          </div>
        </div>
      </div>
    </section>
  );
}
