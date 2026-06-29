"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, useGSAP);

interface WorkData {
  _id?: string;
  title: string;
  description: string;
  image: string;
  order?: number;
}

/* ───────── Fallback Works Data ───────── */

/* ───────── Single Work Card ───────── */
function WorkCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div
      className="works-card group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      {/* Image area — top portion of card */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Title area — dark bottom bar (hides on hover) */}
      <div className="p-4 md:p-5 transition-opacity duration-500 group-hover:opacity-0">
        <h3
          className="text-white font-heading font-bold leading-tight"
          style={{ fontSize: "clamp(1rem, 1.3vw, 1.25rem)" }}
        >
          {title}
        </h3>
      </div>

      {/* Hover State — primary blue gradient overlay with title + description */}
      <div
        className="absolute inset-0 z-20 flex flex-col justify-start p-5 md:p-7 opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background:
            "linear-gradient(135deg, rgba(58,160,204,0.93) 0%, rgba(32,160,213,0.93) 50%, rgba(0,97,150,0.90) 100%)",
        }}
      >
        <h3
          className="text-white font-heading font-bold leading-tight mb-3"
          style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.4rem)" }}
        >
          {title}
        </h3>
        <p
          className="text-white/90 leading-relaxed font-light"
          style={{ fontSize: "clamp(0.8rem, 0.95vw, 0.9rem)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* ───────── Main Section ───────── */
export function OurWorksSection({ initialWorks }: { initialWorks: WorkData[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const worksData = initialWorks;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // Heading entrance
      gsap.fromTo(
        ".works-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".works-heading",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Description entrance
      gsap.fromTo(
        ".works-description",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".works-description",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Cards stagger entrance
      gsap.fromTo(
        ".works-card",
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".works-grid",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "#0a0a0a",
        padding: "220px 0 120px",
        zIndex: 10,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1100px", padding: "0 24px" }}>
        {/* ─── Description ─── */}
        <p
          className="works-description text-white text-center mx-auto"
          style={{
            fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
            lineHeight: 1.5,
            maxWidth: "850px",
          }}
        >
          With over 10 years of experience in industrial packaging
          manufacturing, we have delivered over 200 projects. Discover our
          transparent and strategic approach to creating premium packaging
          solutions that drives results.
        </p>
      </div>

      {/* ─── Works Grid ─── */}
      <div
        className="works-grid mx-auto flex flex-col"
        style={{
          maxWidth: "1100px",
          padding: "0 24px",
          marginTop: "clamp(40px, 5vw, 72px)",
          gap: "16px", // Space between pattern blocks
        }}
      >
        {Array.from({ length: Math.ceil(worksData.length / 5) }).map((_, blockIndex) => {
          const startIndex = blockIndex * 5;
          const blockWorks = worksData.slice(startIndex, startIndex + 5);
          const topRow = blockWorks.slice(0, 3);
          const bottomRow = blockWorks.slice(3, 5);

          return (
            <React.Fragment key={blockIndex}>
              {/* Row 1 — up to 3 cards */}
              {topRow.length > 0 && (
                <div
                  className="grid grid-cols-1 md:grid-cols-3 w-full"
                  style={{ gap: "16px" }}
                >
                  {topRow.map((work, idx) => (
                    <WorkCard key={`${blockIndex}-top-${idx}`} {...work} />
                  ))}
                </div>
              )}

              {/* Row 2 — up to 2 cards centered */}
              {bottomRow.length > 0 && (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 mx-auto w-full max-w-full md:max-w-[var(--desktop-max-w)]"
                  style={{
                    gap: "16px",
                    // Align perfectly with the grid columns above (only on desktop)
                    "--desktop-max-w": bottomRow.length === 2 ? "calc(66.666% + 5px)" : "calc(33.333% - 5px)",
                  } as React.CSSProperties}
                >
                  {bottomRow.map((work, idx) => (
                    <WorkCard key={`${blockIndex}-bottom-${idx}`} {...work} />
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
