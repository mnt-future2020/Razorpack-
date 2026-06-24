"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

import Link from "next/link";

interface ProductLight {
  num: string;
  name: string;
  category: string;
  slug: string;
  image: string;
}

export function ProductsGrid({ initialProducts }: { initialProducts: ProductLight[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // Title Entrance Animation (Advanced 3D Fold Reveal)
      const titleWrapper = section.querySelector(".prd-heading-wrapper");
      const chars = section.querySelectorAll(".prd-heading-char");
      
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
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "top 20%",
          scrub: 1,
        },
      });

      // Section bg: white → dark
      tl.fromTo(
        section,
        { backgroundColor: "#ffffff" },
        { backgroundColor: "#0f1117", ease: "none" },
        0,
      );

      // Heading text → white
      tl.fromTo(
        section.querySelectorAll(".prd-heading-dark"),
        { color: "#36312d" },
        { color: "#ffffff", ease: "none" },
        0,
      );

      // Label → brighter
      tl.fromTo(
        section.querySelector(".products-label"),
        { color: "var(--brand-blue)" },
        { color: "var(--brand-blue)", ease: "none" },
        0,
      );

      // Description → light
      tl.fromTo(
        section.querySelector(".products-desc"),
        { color: "#6B7280" },
        { color: "rgba(255,255,255,0.5)", ease: "none" },
        0,
      );

      // Card titles → white
      tl.fromTo(
        section.querySelectorAll(".card-title"),
        { color: "#ffffff" },
        { color: "#ffffff", ease: "none" },
        0,
      );

      // Card subtitles → lighter
      tl.fromTo(
        section.querySelectorAll(".card-sub"),
        { color: "rgba(255,255,255,0.5)" },
        { color: "rgba(255,255,255,0.7)", ease: "none" },
        0,
      );

      // Separator line
      tl.fromTo(
        section.querySelector(".products-sep"),
        { backgroundColor: "var(--brand-dark)" },
        { backgroundColor: "rgba(255,255,255,0.15)", ease: "none" },
        0,
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-white py-16 md:py-24 px-[4vw]">
      <div className="max-w-[92vw] mx-auto">
        {/* Section header — same style as services page */}
        <div className="prd-heading-wrapper mb-16 md:mb-24 overflow-hidden py-4 flex">
          {"PRODUCTS".split("").map((char, i) => {
            const isBlue = i >= 5;
            return (
              <h2
                key={i}
                className={`prd-heading-char inline-block text-[clamp(3.5rem,8vw,7.5rem)] font-medium tracking-tighter uppercase leading-[0.9] ${
                  isBlue ? "text-[var(--brand-blue)]" : "text-[#36312d] prd-heading-dark"
                }`}
              >
                {char}
              </h2>
            );
          })}
        </div>

        {/* Grid — smaller cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {initialProducts.map((product) => (
            <Link
              key={product.num}
              href={`/products/${product.slug}`}
              className="group relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500 ease-out block"
            >
              {/* Product Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Gradient overlay for text contrast and premium feel */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-black/30 z-10 transition-opacity duration-500 group-hover:from-black/65 group-hover:via-black/10 group-hover:to-black/40" />

              {/* Text */}
              <div className="absolute top-4 left-4 z-20 right-4">
                <h3 className="text-white text-sm md:text-base font-bold uppercase tracking-tight leading-tight mb-1 transition-colors duration-300 group-hover:text-[var(--brand-blue)]">
                  {product.name}
                </h3>
                <p className="text-white/50 text-[9px] md:text-[10px] tracking-widest uppercase font-semibold">
                  {product.num} // {product.category}
                </p>
              </div>

              {/* Arrow */}
              <div className="absolute bottom-3 right-3 z-20 flex items-center justify-center w-7 h-7 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
