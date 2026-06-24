"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useServices } from "@/hooks/use-services";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FALLBACK_SERVICES } from "@/lib/fallback-services";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ServicesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const { services, isLoading } = useServices(1, 100);
  const displayServices =
    services && services.length > 0 ? services : FALLBACK_SERVICES;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // Title Entrance Animation (Advanced 3D Fold Reveal via GSAP MCP Pattern)
      const titleWrapper = section.querySelector(".svc-heading-wrapper");
      const chars = section.querySelectorAll(".svc-heading-char");
      
      if (titleWrapper && chars.length) {
        gsap.set(titleWrapper, { perspective: 800 });
        gsap.fromTo(chars,
          { 
            rotationX: -90, 
            opacity: 0, 
            yPercent: 50,
            transformOrigin: "50% 50% -50"
          },
          {
            rotationX: 0,
            opacity: 1,
            yPercent: 0,
            duration: 1.4,
            ease: "back.out(1.2)",
            stagger: 0.08,
            scrollTrigger: {
              trigger: titleWrapper,
              start: "top 85%",
              toggleActions: "play none none reverse" // Play on enter, reverse on leave back
            }
          }
        );
      }

      setTimeout(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "top 20%",
            scrub: 1,
          },
        });

        tl.fromTo(
          section,
          { backgroundColor: "#ffffff" },
          { backgroundColor: "#0f1117", ease: "none" },
          0,
        );
        tl.fromTo(
          section.querySelectorAll(".svc-heading-dark"),
          { color: "#36312d" },
          { color: "#ffffff", ease: "none" },
          0,
        );
        tl.fromTo(
          section.querySelectorAll(".svc-card"),
          { backgroundColor: "#ffffff" },
          { backgroundColor: "#0f1117", ease: "none" },
          0,
        );
        tl.fromTo(
          section.querySelectorAll(".svc-card"),
          { borderColor: "rgba(54,49,45,0.06)" },
          { borderColor: "rgba(255,255,255,0.06)", ease: "none" },
          0,
        );
        tl.fromTo(
          section.querySelectorAll(".svc-num"),
          { color: "rgba(240,232,223,1)" },
          { color: "rgba(68,184,232,0.15)", ease: "none" },
          0,
        );
        tl.fromTo(
          section.querySelectorAll(".svc-title"),
          { color: "#36312d" },
          { color: "#ffffff", ease: "none" },
          0,
        );
        tl.fromTo(
          section.querySelectorAll(".svc-desc"),
          { color: "#8c827a" },
          { color: "rgba(255,255,255,0.5)", ease: "none" },
          0,
        );
        tl.fromTo(
          section.querySelectorAll(".svc-feature"),
          { color: "#8c827a" },
          { color: "rgba(255,255,255,0.45)", ease: "none" },
          0,
        );
        tl.fromTo(
          section.querySelectorAll(".svc-cta"),
          { color: "#36312d", borderColor: "rgba(54,49,45,0.3)" },
          {
            color: "var(--brand-blue)",
            borderColor: "rgba(68,184,232,0.3)",
            ease: "none",
          },
          0,
        );

        ScrollTrigger.refresh();
      }, 500);
    },
    { scope: sectionRef, dependencies: [isLoading] },
  );

  if (isLoading) {
    return (
      <section className="py-20 bg-white min-h-screen flex items-center justify-center">
        <div className="space-y-8 w-full max-w-[92vw] mx-auto px-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[400px] w-full bg-stone-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full pt-24 pb-32 md:pt-32 px-[4vw]"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="max-w-[92vw] mx-auto relative">
        {/* Pinned Title Section */}
        <div className="svc-heading-wrapper mb-16 md:mb-24 overflow-hidden py-4 flex">
          {"SERVICES".split("").map((char, i) => {
            const isBlue = i >= 5;
            return (
              <h2
                key={i}
                className={`svc-heading-char inline-block text-[clamp(3.5rem,8vw,7.5rem)] font-medium tracking-tighter uppercase leading-[0.9] ${
                  isBlue ? "text-[var(--brand-blue)]" : "text-[#36312d] svc-heading-dark"
                }`}
              >
                {char}
              </h2>
            );
          })}
        </div>

        {/* Stacking Cards List */}
        <div className="relative">
          {displayServices.map((service, index) => {
            const stickyTop = `calc(10vh + ${index * 40}px)`;

            return (
              <div
                key={service._id}
                style={{ top: stickyTop, backgroundColor: "#ffffff" }}
                className="svc-card sticky w-full pt-10 pb-16 md:pt-14 md:pb-24 border-t border-[#36312d]/[0.06] group/card"
              >
                <Link href={`/services/${service.slug}`} className="absolute inset-0 z-10" aria-label={`View ${service.serviceName} details`} />
                <div className="grid grid-cols-1 md:grid-cols-[32%_1fr] gap-x-[12%] gap-y-6 md:gap-y-8 relative z-20 pointer-events-none">
                  {/* Row 1: Number and Title */}
                  <div className="flex items-start">
                    <span className="svc-num text-[clamp(4rem,8vw,6.5rem)] font-bold text-[#f0e8df] leading-[0.8] select-none tracking-tighter">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex items-start md:pt-2">
                    <h3 className="svc-title text-[clamp(2rem,4vw,3.5rem)] font-medium text-[#36312d] tracking-tight leading-[1.1]">
                      {service.serviceName}
                    </h3>
                  </div>

                  {/* Row 2: Image and Description */}
                  <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-stone-100">
                    {service.image && (
                      <Image
                        src={service.image}
                        alt={service.serviceName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    )}
                  </div>

                  <div className="flex flex-col justify-center h-full">
                    {/* Description — truncated for card view */}
                    <p className="svc-desc text-[#8c827a] font-normal text-sm md:text-[15px] leading-relaxed max-w-[400px] mb-6">
                      {(service.shortDescription || service.description?.replace(/<[^>]+>/g, '') || "").slice(0, 150)}{(service.shortDescription || service.description || "").length > 150 ? "..." : ""}
                    </p>

                    {/* Features List */}
                    {service.features && service.features.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 mb-8 max-w-[400px]">
                        {service.features.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#8c827a] shrink-0 mt-0.5" />
                            <span className="svc-feature text-sm text-[#8c827a] font-normal">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Learn More Action Button */}
                    <div className="mt-2">
                      <Link
                        href={`/services/${service.slug}`}
                        className="svc-cta inline-flex items-center gap-2 text-[#36312d] font-medium hover:text-[#8c827a] transition-colors group text-sm border-b border-[#36312d]/30 pb-1 hover:border-[#36312d]"
                      >
                        <span>Explore Service Details</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
