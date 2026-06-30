"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface PageHeroProps {
  label: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  /**
   * The background image URL or path for the hero.
   * Recommended image size: 1600 × 1000px (landscape, 16:10 ratio).
   */
  image: string;
  imageAlt?: string;
  showPlayButton?: boolean;
  theme?: "light" | "dark";
  bgGraphicTopRight?: string;
  bgGraphicBottomLeft?: string;
  /** Use "contain" for portrait/square product images, "cover" for wide landscape photos */
  imageFit?: "cover" | "contain";
}

export function PageHero({
  label,
  headingLine1,
  headingLine2,
  description,
  image,
  imageAlt = "",
  showPlayButton = false,
  theme = "light",
  bgGraphicTopRight = "/images/rayzor/hero/hero_bg_texture_top_right_packaging.png",
  bgGraphicBottomLeft = "/images/rayzor/hero/hero_bg_texture_bottom_left_packaging.png",
  imageFit = "cover",
}: PageHeroProps) {
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollLabelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const imageWrapper = imageWrapperRef.current;
      const text = textRef.current;
      const scrollLabel = scrollLabelRef.current;

      if (!section || !imageWrapper || !text || !scrollLabel) return;

      // --- UNIQUE ENTRANCE ANIMATION ---
      const tlEntrance = gsap.timeline({ defaults: { ease: "power4.out" } });

      // 1. Image reveals via elegant diagonal clip-path and scales down
      tlEntrance.fromTo(
        imageWrapper,
        {
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
          scale: 1.15,
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          scale: 1,
          duration: 1.6,
          ease: "power3.inOut",
        },
        0,
      );

      // 2. The blue label line scales in
      tlEntrance.fromTo(
        ".hero-label-line",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.8 },
        0.5,
      );

      // 3. Label text slides in
      tlEntrance.fromTo(
        ".hero-label-text",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        0.6,
      );

      // 4. Main heading words sweep up from an invisible mask with a slight skew
      tlEntrance.fromTo(
        ".hero-title-line",
        { yPercent: 120, skewY: 3 },
        { yPercent: 0, skewY: 0, duration: 1.2, stagger: 0.15 },
        0.5,
      );

      // 5. Description blurs and fades in
      tlEntrance.fromTo(
        ".hero-desc",
        { opacity: 0, y: 20, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 },
        0.8,
      );

      // 6. Scroll indicator drops and bounces in
      tlEntrance.fromTo(
        scrollLabel,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 1.2, ease: "bounce.out" },
        1.2,
      );

      // --- SCROLL ANIMATION (desktop only) ---
      if (window.innerWidth >= 768) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          imageWrapper,
          {
            width: "94vw",
            height: "96vh",
            bottom: "2vh",
            right: "auto",
            left: "50%",
            xPercent: -50,
            borderRadius: "12px",
            ease: "power2.inOut",
            duration: 1,
          },
          0,
        );

        tl.to(text, { y: "-120vh", ease: "none", duration: 1 }, 0);
        tl.to(scrollLabel, { y: "-50vh", ease: "none", duration: 0.8 }, 0);
        tl.to(".hero-bg-graphic", { opacity: 0, ease: "none", duration: 0.4 }, 0);
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: isDark ? "#0f1117" : "#ffffff" }}
    >
      {/* ─── BACKGROUND GRAPHICS (Light Theme Only) ─── */}
      {!isDark && (
        <>
          <div className="hero-bg-graphic absolute top-0 right-0 w-[45vw] h-[55vh] z-0 opacity-[0.35] mix-blend-multiply pointer-events-none">
            <Image
              src={bgGraphicTopRight}
              alt=""
              fill
              className="object-cover object-right-top"
              priority
              sizes="45vw"
            />
          </div>
          <div className="hero-bg-graphic absolute bottom-0 left-0 w-[45vw] h-[45vh] z-0 opacity-[0.35] mix-blend-multiply pointer-events-none">
            <Image
              src={bgGraphicBottomLeft}
              alt=""
              fill
              className="object-cover object-left-bottom"
              priority
              sizes="45vw"
            />
          </div>
        </>
      )}

      {/* ─── TEXT ─── */}
      <div
        ref={textRef}
        className="absolute top-[10vh] md:top-[12vh] left-[5vw] md:left-[4vw] z-10 max-w-[90vw] md:max-w-[65vw]"
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="hero-label-line w-6 md:w-8 h-[2px] bg-[var(--brand-blue)]" />
          <span
            className="hero-label-text text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] font-medium"
            style={{ color: "var(--brand-blue)" }}
          >
            {label}
          </span>
        </div>

        <h1 className="font-heading leading-[0.92] tracking-[-0.03em]">
          <div className="overflow-hidden pb-1">
            <span
              className="hero-title-line block text-[clamp(2rem,8vw,7.5rem)] font-extrabold uppercase"
              style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
            >
              {headingLine1}
            </span>
          </div>
          <div className="overflow-hidden pb-2 md:pb-4">
            <span className="hero-title-line block">
              <span
                className="text-[clamp(2rem,8vw,7.5rem)] font-extralight uppercase"
                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#999" }}
              >
                &amp;{" "}
              </span>
              <span
                className="text-[clamp(2rem,8vw,7.5rem)] font-extrabold uppercase"
                style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
              >
                {headingLine2}
              </span>
            </span>
          </div>
        </h1>

        <p
          className={`hero-desc mt-4 md:mt-8 border-l-2 border-[var(--brand-blue)]/40 pl-4 md:pl-5 text-sm md:text-[15px] leading-relaxed max-w-[85vw] md:max-w-[450px] font-light ${isDark ? "text-gray-300" : "text-gray-600"}`}
        >
          {description}
        </p>
      </div>

      {/* ─── SCROLL INDICATOR ─── */}
      <div
        ref={scrollLabelRef}
        className="absolute bottom-[6vh] left-[5vw] z-10 hidden md:flex items-center gap-2"
      >
        <span
          className="text-[11px] uppercase tracking-[0.2em] font-semibold"
          style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
        >
          SCROLL
        </span>
        <svg
          className="w-3 h-3 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke={isDark ? "#ffffff" : "#1a1a1a"}
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      {/* ─── IMAGE ─── */}
      <div
        ref={imageWrapperRef}
        className="absolute overflow-hidden w-[92vw] md:w-[48vw] h-[40vh] md:h-[60vh] bottom-0 md:bottom-[-5vh] right-0 rounded-tl-md md:rounded-none"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          className={`hero-img-contain z-10 ${imageFit === "contain" ? "object-contain" : "object-cover"}`}
          priority
          sizes="100vw"
        />

        {showPlayButton && (
          <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors z-20 shadow-lg">
            <svg className="w-4 h-4 ml-0.5" fill="#1a1a1a" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
