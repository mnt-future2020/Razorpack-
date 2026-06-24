"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    id: "requirements-engineering",
    number: "01",
    label: "Requirements & Engineering",
    description:
      "We analyze your specific requirements, chemical sensitivities, transit hazards, and metal composition to engineer bespoke packaging specifications.",
    image: "/images/rayzor_collaboration.png",
  },
  {
    id: "material-extrusion",
    number: "02",
    label: "Material Extrusion",
    description:
      "High-performance resins are blended with custom VCI (Volatile Corrosion Inhibitor) masterbatches and co-extruded into multi-layer heavy-duty films.",
    image: "/images/rayzor_vci_film_rolls.png",
  },
  {
    id: "advanced-manufacturing",
    number: "03",
    label: "Advanced Manufacturing",
    description:
      "Our automated conversion lines manufacture custom poly bags, 3D barrier liners, pallet covers, and printed film sheets to exact dimensional tolerances.",
    image: "/images/rayzor_manufacturing_hub.png",
  },
  {
    id: "quality-dispatch",
    number: "04",
    label: "Quality Lab & Dispatch",
    description:
      "Every batch undergoes rigorous quality testing for tear strength, thickness, and VCI concentration before certified dispatch across India and globally.",
    image: "/images/rayzor_quality_inspection.png",
  },
];

export function AboutProcess() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // 1. Initial State Setup
      // Use transformOrigin bottom to ensure the bottom steps are uniform and don't shrink upwards
      gsap.set(".process-card", {
        y: (i) => i * 20, // 20px vertical gap for the stack for more prominence
        scale: (i) => 1 - i * 0.05, // 5% horizontal scale shrink per card
        opacity: 1, // Keep all solid to prevent bleeding
        transformOrigin: "bottom center",
      });

      // 2. Master ScrollTimeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${STEPS.length * 100}%`, // Scroll duration
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 3. Animate each card off the deck
      STEPS.forEach((_, i) => {
        // Last card stays on screen
        if (i === STEPS.length - 1) return;

        const stepTl = gsap.timeline();

        // The top card slides completely off the bottom of the screen
        stepTl.to(
          `.process-card-${i}`,
          {
            yPercent: 120, // Slide down completely
            ease: "none",
          },
          0
        );

        // All the cards BEHIND the top card shuffle up into the new positions
        for (let j = i + 1; j < STEPS.length; j++) {
          const targetSlot = j - i - 1; 
          stepTl.to(
            `.process-card-${j}`,
            {
              y: targetSlot * 20,
              scale: 1 - targetSlot * 0.05,
              ease: "none",
            },
            0
          );
        }

        tl.add(stepTl);
      });

      // 4. Entrance reveal for left elements: Slide up from mask container
      gsap.fromTo(
        ".process-title-line-1",
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 1.0,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          }
        }
      );

      gsap.fromTo(
        ".process-title-line-2",
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 1.0,
          delay: 0.15,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          }
        }
      );

      gsap.fromTo(
        ".process-desc",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          }
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-white overflow-hidden flex selection:bg-[var(--brand-blue)]/30 selection:text-[var(--brand-dark)]"
    >
      {/* ─── LEFT: PINNED TEXT ─── */}
      <div className="w-[42%] h-full pt-[12vh] pl-[6vw] z-10 flex flex-col justify-start">
        <h2 className="text-[var(--brand-dark)] font-heading font-black leading-[0.9] tracking-tighter text-[clamp(2.5rem,4.5vw,5.5rem)] uppercase mb-8 mt-0">
          <div className="overflow-hidden py-1">
            <span className="process-title-line-1 block">PACKAGING</span>
          </div>
          <div className="overflow-hidden py-1">
            <span className="process-title-line-2 block text-[var(--brand-blue)]">PROCESS</span>
          </div>
        </h2>
        <p className="process-desc text-[#4b5563] text-sm md:text-base font-light max-w-[420px] leading-relaxed tracking-wide">
          Every Rayzor Industrial Packaging product goes through a precise, quality-focused manufacturing process to ensure industrial strength, durability, and corrosion protection from start to finish.
        </p>
      </div>

      {/* ─── RIGHT: CARD DECK ─── */}
      <div className="w-[58%] h-full relative perspective-1000">
        {STEPS.map((step, i) => {
          // Top cards have higher z-index
          const zIndex = STEPS.length - i;
          return (
            <div
              key={step.id}
              className={`process-card process-card-${i} absolute right-[4vw] top-[12vh] w-[92%] max-w-[1000px] h-[76vh] rounded-[1.25rem] bg-white shadow-md border border-[var(--border)] overflow-hidden flex`}
              style={{ zIndex }}
            >
              {/* Card Left: Text */}
              <div className="w-1/2 h-full p-10 xl:p-14 flex flex-col justify-between">
                {/* Thin, elegant Number */}
                <div className="font-sans font-bold text-[4.5rem] xl:text-[5.5rem] leading-none text-[#006196]/15 tracking-tighter">
                  {step.number}
                </div>

                {/* Info block */}
                <div>
                  <h3 className="text-[var(--brand-dark)] font-semibold text-2xl xl:text-[1.75rem] mb-3 tracking-[-0.02em] leading-tight">
                    {step.label}
                  </h3>
                  <p className="text-[#3f4850] text-[0.8rem] xl:text-[0.85rem] leading-[1.6] tracking-tight font-medium">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Card Right: Image */}
              <div className="w-1/2 relative h-full">
                <Image
                  src={step.image}
                  alt={step.label}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
