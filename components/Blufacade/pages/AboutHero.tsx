"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AboutHero() {
  const containerRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=250%", // Pins for 2.5x the viewport height
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Phase 1: Slide left panel out
      tl.to(
        leftPanelRef.current,
        {
          xPercent: -100,
          duration: 1,
          ease: "power2.inOut",
        },
        0,
      );

      // Slight parallax on the left text as it slides out
      tl.to(
        leftTextRef.current,
        {
          x: -100,
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
        },
        0,
      );

      // Lighten the image overlay slightly
      tl.to(
        overlayRef.current,
        {
          backgroundColor: "rgba(0,0,0,0.3)",
          duration: 1,
          ease: "power1.inOut",
        },
        0,
      );

      // Phase 2: Fade in the center text
      tl.fromTo(
        centerTextRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        0.8, // Start fading in just before the panel is completely gone
      );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* BACKGROUND IMAGE W/ OVERLAY */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/images/abstract_packaging_film.png"
          alt="Rayzor Industrial Packaging Pvt Ltd Premium Industrial Packaging"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black/60 transition-colors"
        />
      </div>

      {/* CENTER TEXT (Revealed later) */}
      <div
        ref={centerTextRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 md:px-12 text-center pointer-events-none opacity-0"
      >
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-heading font-light tracking-tight text-white/90 max-w-5xl leading-tight mb-8">
          <span className="italic font-serif opacity-90">
            Where expertise meets
          </span>{" "}
          <br />
          innovation in tailor-made packaging{" "}
          <br className="hidden md:block" />
          for{" "}
          <span className="italic font-serif opacity-90">
            over two decades.
          </span>
        </h2>
        <p className="text-white/60 text-sm md:text-base max-w-2xl font-light tracking-wide leading-relaxed">
          Our production hub in Madurai, Tamil Nadu stands as a testament to our
          commitment to precision and quality. Specializing in VCI &amp; LDPE
          packaging solutions, we cater to diverse industries — ensuring your
          products receive packaging that not only protects but enhances their value.
        </p>
      </div>

      {/* LEFT DARK PANEL (Slides away) */}
      <div
        ref={leftPanelRef}
        className="absolute top-0 left-0 h-full w-[85%] md:w-[45%] bg-[#020617] z-20 flex flex-col justify-center pl-4 sm:pl-6 lg:pl-8 xl:pl-10 pr-6 lg:pr-12 border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Subtle glow accent */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(38,168,224,0.2) 0%, transparent 60%)' }} />

        {/* Text Content */}
        <div ref={leftTextRef} className="relative z-10 flex flex-col gap-10 md:gap-14">
          <h1 className="font-heading font-black text-[clamp(3.5rem,5.5vw,6rem)] leading-[0.85] tracking-[-0.03em] text-white uppercase break-words">
            ELEVATING <br />
            <span className="text-[var(--brand-blue)]">PACKAGING.</span> <br />
            MASTERING <br />
            <span className="text-white/40">PROTECTION.</span>
          </h1>

          <p className="text-white/60 text-sm md:text-base max-w-[85%] leading-relaxed font-light tracking-wide border-l-2 border-[var(--brand-blue)]/50 pl-5">
            For over two decades, we&apos;ve been the driving force behind tailor-made
            packaging solutions. Our in-house production, coupled with strict quality
            standards and reliable suppliers, ensures flexibility and reliability —
            contributing to the &quot;Made in India&quot; legacy.
          </p>
        </div>
      </div>
    </section>
  );
}
