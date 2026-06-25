"use client";

import React, { useRef, useMemo } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useBanner } from "@/hooks/use-banner";

gsap.registerPlugin(useGSAP);

/* ───────── Image data ───────── */
const column1Images = [
  {
    src: "/images/gallery/col1_img1.png",
    alt: "Modern packaging factory floor with LDPE film roll machines",
  },
  {
    src: "/images/gallery/col1_img2.png",
    alt: "Stretch film rolls and LDPE poly bags in warehouse",
  },
  {
    src: "/images/gallery/col1_img3.png",
    alt: "VCI packaging protecting metal automotive parts",
  },
];

const column2Images = [
  {
    src: "/images/gallery/col2_img1.png",
    alt: "Packaging engineers examining custom printed poly bags",
  },
  {
    src: "/images/gallery/col2_img2.png",
    alt: "Modern packaging warehouse with organized film rolls",
  },
  {
    src: "/images/gallery/col2_img3.png",
    alt: "Industrial packaging production line with automated machinery",
  },
];

const column3Images = [
  {
    src: "/images/gallery/col3_img1.png",
    alt: "Industrial trade exhibition booth showcasing packaging solutions",
  },
  {
    src: "/images/gallery/col3_img2.png",
    alt: "Custom printed packaging bags on flexographic printing press",
  },
  {
    src: "/images/gallery/col3_img3.png",
    alt: "Logistics loading dock with pallets wrapped in stretch film",
  },
];

/* ───────── Sub-component: one column of sliding images ───────── */
interface SlidingColumnProps {
  images: { src: string; alt: string }[];
  direction: "down" | "up";
  columnClass: string;
  /** Initial Y offset to stagger columns like the reference */
  initialOffset?: string;
}

function SlidingColumn({
  images,
  direction,
  columnClass,
  initialOffset = "-25%",
}: SlidingColumnProps) {
  // Duplicate 4x for seamless infinite loop with enough content
  const duped = [...images, ...images, ...images, ...images];

  return (
    <div className="relative w-full overflow-hidden h-full">
      <div
        className={`${columnClass} flex flex-col`}
        style={{
          gap: "4px",
          transform: `translateY(${initialOffset})`,
        }}
      >
        {duped.map((img, idx) => (
          <div
            key={`${img.src}-${idx}`}
            className="relative w-full flex-shrink-0 rounded-md overflow-hidden"
            style={{
              /* 3 rows × 32vh ≈ 96vh + gaps = fills viewport.
                 Images partially crop at top/bottom — matching reference */
              height: "34vh",
              minHeight: "180px",
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="34vw"
              priority={idx < 3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Main Component ───────── */
export function GalleryHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { banner } = useBanner("gallery");

  // Combine uploaded hero images + selected work images (from heroSource JSON)
  const { col1, col2, col3 } = useMemo(() => {
    const uploadedImages = banner?.images?.filter(Boolean) || [];

    // Parse selected work image URLs from heroSource field
    let selectedWorkUrls: string[] = [];
    try {
      const parsed = JSON.parse((banner as any)?.heroSource || "[]");
      if (Array.isArray(parsed)) selectedWorkUrls = parsed.filter(Boolean);
    } catch { /* not JSON, ignore */ }

    // Combine: uploaded + selected works (no duplicates)
    const allImages = [...uploadedImages];
    selectedWorkUrls.forEach((img) => {
      if (!allImages.includes(img)) allImages.push(img);
    });

    if (allImages.length >= 3) {
      const perCol = Math.ceil(allImages.length / 3);
      return {
        col1: allImages.slice(0, perCol).map((src, i) => ({ src, alt: `Gallery image ${i + 1}` })),
        col2: allImages.slice(perCol, perCol * 2).map((src, i) => ({ src, alt: `Gallery image ${perCol + i + 1}` })),
        col3: allImages.slice(perCol * 2).map((src, i) => ({ src, alt: `Gallery image ${perCol * 2 + i + 1}` })),
      };
    }
    return { col1: column1Images, col2: column2Images, col3: column3Images };
  }, [banner]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      /* --- Title entrance --- */
      const tlEntrance = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      tlEntrance.fromTo(
        ".gallery-hero-title",
        { opacity: 0, scale: 0.85, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 1.4 },
        0.3,
      );

      tlEntrance.fromTo(
        ".gallery-hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        0.8,
      );

      /* --- Infinite column scroll animations --- */

      // Column 1 — slides DOWN
      gsap.to(".gallery-col-1-strip", {
        yPercent: "+=25",
        duration: 25,
        ease: "none",
        repeat: -1,
        modifiers: {
          yPercent: gsap.utils.wrap(-50, 0),
        },
      });

      // Column 2 — slides UP
      gsap.to(".gallery-col-2-strip", {
        yPercent: "-=25",
        duration: 20,
        ease: "none",
        repeat: -1,
        modifiers: {
          yPercent: gsap.utils.wrap(-50, 0),
        },
      });

      // Column 3 — slides DOWN
      gsap.to(".gallery-col-3-strip", {
        yPercent: "+=25",
        duration: 28,
        ease: "none",
        repeat: -1,
        modifiers: {
          yPercent: gsap.utils.wrap(-50, 0),
        },
      });

      // Scroll animation to move the title down to the next section
      gsap.to(".gallery-hero-title-wrapper", {
        y: () => window.innerHeight * 0.5 + 140,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="gallery-hero"
      className="relative w-full"
      style={{
        /* Full viewport height — pull up behind the header */
        height: "100vh",
        marginTop: "-80px",
        paddingTop: "0",
        backgroundColor: "#000000",
        zIndex: 20,
      }}
    >
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* ─── Responsive Grid: 2 columns on mobile, 3 on desktop ─── */}
        <div
          className="absolute grid grid-cols-2 md:grid-cols-3"
          style={{
            /* Extend beyond viewport so images crop at top/bottom like reference */
            top: "-30%",
            left: "0",
            right: "0",
            height: "200%",
            gap: "4px",
            padding: "0",
          }}
        >
          <SlidingColumn
            images={col1}
            direction="down"
            columnClass="gallery-col-1-strip"
            initialOffset="-20%"
          />
          <SlidingColumn
            images={col2}
            direction="up"
            columnClass="gallery-col-2-strip"
            initialOffset="-30%"
          />
          <div className="hidden md:block w-full h-full relative">
            <SlidingColumn
              images={col3}
              direction="down"
              columnClass="gallery-col-3-strip"
              initialOffset="-15%"
            />
          </div>
        </div>

      {/* ─── Dark Overlay ─── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #000000 0%, transparent 100%)",
        }}
      />
      </div>

      {/* ─── Centered Title ─── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-4">
        <div className="gallery-hero-title-wrapper w-full max-w-5xl mx-auto flex justify-center">
          <h1
            className="gallery-hero-title font-heading text-white text-center uppercase select-none text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] leading-[1.1] md:leading-[1]"
            style={{
              fontWeight: 900,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 40px rgba(0,0,0,0.6)",
              wordBreak: "keep-all",
            }}
          >
            OUR WORKS
          </h1>
        </div>
      </div>
    </section>
  );
}
