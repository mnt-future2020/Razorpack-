"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface OtherServicesAnimationProps {
  services: { serviceName: string; slug: string }[];
  currentSlug: string;
}

export function OtherServicesAnimation({
  services,
  currentSlug,
}: OtherServicesAnimationProps) {
  const containerRef = useRef<HTMLElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const centerListRef = useRef<HTMLDivElement>(null);

  // Filter out the current service so we don't link to the page we are already on
  const otherServices = services.filter((s) => s.slug !== currentSlug);

  useGSAP(
    () => {
      // Return early if elements are missing
      if (!containerRef.current || !leftTextRef.current || !rightTextRef.current || !centerListRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%", // Longer pin for distinct animation phases
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // ─── PHASE 1: Split rapidly to the edges ───
      // We must move them far apart quickly so long service names like "EXPORT PALLETIZATION" 
      // don't overlap with them when they fade in!
      tl.to(
        leftTextRef.current,
        {
          x: "-28vw", 
          color: "#999999", 
          ease: "power2.out",
          duration: 1,
        },
        0
      );

      tl.to(
        rightTextRef.current,
        {
          x: "28vw", 
          color: "#999999", 
          ease: "power2.out",
          duration: 1,
        },
        0
      );

      // ─── PHASE 2: Fade to watermark, continue moving out, reveal center list ───
      tl.to(
        leftTextRef.current,
        {
          x: "-35vw", 
          color: "rgba(0,0,0,0.03)", // Watermark fade
          ease: "power1.inOut",
          duration: 1.5,
        },
        1
      );

      tl.to(
        rightTextRef.current,
        {
          x: "35vw", 
          color: "rgba(0,0,0,0.03)", 
          ease: "power1.inOut",
          duration: 1.5,
        },
        1
      );

      // Center list reveals during Phase 2 with a staggered slide-up
      tl.fromTo(
        ".service-link-item",
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, ease: "power2.out", duration: 0.8, stagger: 0.15 },
        1.0 // Starts at the beginning of Phase 2
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#e3e3e3] overflow-hidden flex items-center justify-center selection:bg-black selection:text-white"
    >
      {/* ─── HUGE SPLITTING TEXT (Background/Watermark) ─── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="flex w-full items-center justify-center">
          <div
            ref={leftTextRef}
            className="font-heading font-black text-[clamp(4rem,10.5vw,16rem)] leading-none text-[#2b2b2b] tracking-[-0.05em] uppercase whitespace-nowrap will-change-transform"
          >
            OTHER&nbsp;
          </div>
          <div
            ref={rightTextRef}
            className="font-heading font-black text-[clamp(4rem,10.5vw,16rem)] leading-none text-[#2b2b2b] tracking-[-0.05em] uppercase whitespace-nowrap will-change-transform"
          >
            SERVICE
          </div>
        </div>
      </div>

      {/* ─── CENTER INTERACTIVE LIST ─── */}
      <div
        ref={centerListRef}
        className="relative z-10 flex flex-col items-center justify-center w-full px-4"
      >
        {otherServices.map((service, index) => (
          <Link
            key={index}
            href={`/services/${service.slug}`}
            className="service-link-item opacity-0 font-heading font-black text-[clamp(1.5rem,4.5vw,4rem)] text-[#1a1a1a] uppercase hover:text-[var(--brand-blue)] transition-colors duration-300 leading-[0.9] tracking-[-0.03em] text-center"
          >
            {service.serviceName}
          </Link>
        ))}
      </div>
    </section>
  );
}
