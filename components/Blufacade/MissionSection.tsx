"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowDownRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { WordRotate } from "@/components/ui/word-rotate";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { RevealOnScroll } from "@/components/gsap/reveal-on-scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const whyChooseUsData = [
  {
    num: "01",
    title: "Precision Quality & Structural Strength",
    description:
      "Every batch of our LDPE films and poly bags undergoes rigorous tensile strength, tear resistance, and gauge consistency testing in our state-of-the-art laboratory in Madurai.",
    image: "/images/rayzor/why-choose-us/quality.png",
    spec: "100% QA CHECKED",
  },
  {
    num: "02",
    title: "Proprietary VCI Rust Prevention",
    description:
      "Our advanced Vapor Corrosion Inhibitor (VCI) poly bags and sheets chemically shield metal components, preventing oxidation and rust during international shipping.",
    image: "/images/rayzor/why-choose-us/vci.png",
    spec: "VCI RUST SHIELD",
  },
  {
    num: "03",
    title: "Sustainable Material Engineering",
    description:
      "Formulated with premium, high-strength recyclable polymers, our packaging films minimize carbon footprint while maintaining exceptional puncture resistance.",
    image: "/images/rayzor/why-choose-us/sustainability.png",
    spec: "100% RECYCLABLE",
  },
  {
    num: "04",
    title: "Reliable High-Volume Supply Network",
    description:
      "With high-capacity extrusion machinery and a robust distribution network, we guarantee on-time shipping schedules for corporate industrial clients worldwide.",
    image: "/images/rayzor/why-choose-us/logistics.png",
    spec: "99% ON-TIME",
  },
];

const stats = [
  { value: 100, label: "Quality Assurance", suffix: "%" },
  { value: 500, label: "Happy Clients", suffix: "+" },
  { value: 25, label: "Years Experience", suffix: "+" },
  { value: 99, label: "On-Time Delivery", suffix: "%" },
];

function AccordionItem({
  item,
  index,
  isActive,
  onActivate,
}: {
  item: (typeof whyChooseUsData)[0];
  index: number;
  isActive: boolean;
  onActivate: (i: number) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Expose refs for parent to control
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    // Set data attributes so parent can query
    content.setAttribute("data-accordion-content", String(index));
  }, [index]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    inner.setAttribute("data-accordion-inner", String(index));
  }, [index]);

  // Initialize: first item open, rest closed (no animation)
  useEffect(() => {
    const content = contentRef.current;
    const inner = innerRef.current;
    if (!content || !inner) return;
    if (!isActive) {
      gsap.set(content, { height: 0, overflow: "hidden" });
      gsap.set(inner, { opacity: 0, y: 10 });
    }
  }, []);

  return (
    <div
      onMouseEnter={() => onActivate(index)}
      onClick={() => onActivate(index)}
      className="border-b border-line"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between py-6 md:py-8 cursor-pointer">
        <div className="flex items-baseline gap-4 md:gap-10 flex-1 pr-4">
          <span
            className="font-mono text-sm md:text-base w-6 md:w-8 tabular-nums transition-colors duration-300"
            style={{ color: isActive ? "#1689cf" : "#3f485080" }}
          >
            {item.num}
          </span>
          <h3
            className="accordion-title text-lg sm:text-xl md:text-[2rem] font-heading font-bold tracking-tight leading-tight transition-colors duration-300"
            style={{ color: isActive ? "var(--acc-active, #1b1c19)" : "var(--acc-inactive, rgba(27,28,25,0.8))" }}
          >
            {item.title}
          </h3>
        </div>

        {/* Toggle Button — transitions.dev: icon swap */}
        <div
          className="w-10 h-10 md:w-11 md:h-11 rounded-md flex items-center justify-center border transition-all duration-300"
          style={{
            backgroundColor: isActive ? "#006196" : "var(--acc-btn-bg, #1b1c19)",
            borderColor: isActive ? "#006196" : "var(--acc-btn-bg, #1b1c19)",
            transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <div className="t-icon-swap" data-state={isActive ? "b" : "a"}>
            <span className="t-icon flex items-center justify-center" data-icon="a">
              <ArrowDownRight className="w-4 h-4 text-white" />
            </span>
            <span className="t-icon flex items-center justify-center" data-icon="b">
              <X className="w-4 h-4 text-white" />
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible Content — GSAP height + transitions.dev panel blur */}
      <div ref={contentRef} className="overflow-hidden">
        <div ref={innerRef} className="t-panel-slide pb-8 pt-2 flex flex-col gap-5" data-open={isActive ? "true" : "false"} style={{ "--panel-translate-y": "20px" } as React.CSSProperties}>
          {/* Description + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <p className="accordion-desc text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl" style={{ color: "var(--acc-desc, #3f4850)" }}>
              {item.description}
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-brand font-bold text-sm hover:text-brand-deep transition-colors shrink-0 group/link"
            >
              Explore our services
              <ArrowDownRight className="w-4 h-4 -rotate-45 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Full-width Image with spec overlay + BorderBeam */}
          <div className="relative w-full aspect-16/10 sm:aspect-21/9 rounded-md overflow-hidden border border-line bg-ink">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
            <BorderBeam
              size={150}
              duration={6}
              colorFrom="#1689cf"
              colorTo="#feb234"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MissionSection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const prevIndex = useRef<number>(0);
  const isAnimating = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // ── Background color transition: white → dark on scroll ──
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

      // Heading text: dark → white
      tl.fromTo(
        section.querySelector(".mission-title"),
        { color: "#2D2D2D" },
        { color: "#ffffff", ease: "none" },
        0,
      );

      // Subtitle text: steel → light
      tl.fromTo(
        section.querySelector(".mission-subtitle"),
        { color: "#3f4850" },
        { color: "rgba(255,255,255,0.6)", ease: "none" },
        0,
      );

      // Accordion row borders
      tl.fromTo(
        section.querySelectorAll(".accordion-row"),
        { borderColor: "rgba(191,199,210,0.3)" },
        { borderColor: "rgba(255,255,255,0.08)", ease: "none" },
        0,
      );

      // Accordion text colors via CSS custom properties
      tl.fromTo(
        section,
        {
          "--acc-active": "#1b1c19",
          "--acc-inactive": "rgba(27,28,25,0.8)",
          "--acc-desc": "#3f4850",
        },
        {
          "--acc-active": "#ffffff",
          "--acc-inactive": "rgba(255,255,255,0.5)",
          "--acc-desc": "rgba(255,255,255,0.45)",
          ease: "none",
        },
        0,
      );

      // Toggle button bg via CSS custom property
      tl.fromTo(
        section,
        { "--acc-btn-bg": "#1b1c19" },
        { "--acc-btn-bg": "rgba(255,255,255,0.1)", ease: "none" },
        0,
      );

      // Accordion entrance stagger
      gsap.fromTo(
        ".accordion-row",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".accordion-list",
            start: "top 80%",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  const handleActivate = useCallback(
    (newIndex: number) => {
      if (newIndex === activeIndex || isAnimating.current) return;
      isAnimating.current = true;

      const list = listRef.current;
      if (!list) {
        isAnimating.current = false;
        return;
      }

      const oldContent = list.querySelector(
        `[data-accordion-content="${activeIndex}"]`,
      ) as HTMLElement;
      const oldInner = list.querySelector(
        `[data-accordion-inner="${activeIndex}"]`,
      ) as HTMLElement;
      const newContent = list.querySelector(
        `[data-accordion-content="${newIndex}"]`,
      ) as HTMLElement;
      const newInner = list.querySelector(
        `[data-accordion-inner="${newIndex}"]`,
      ) as HTMLElement;

      if (!oldContent || !newContent || !oldInner || !newInner) {
        isAnimating.current = false;
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      const dur = 0.4;

      // Fade out old inner instantly
      tl.to(oldInner, { opacity: 0, duration: 0.15, ease: "power2.in" }, 0);

      // Close old + open new SIMULTANEOUSLY so total height stays constant
      tl.to(oldContent, { height: 0, duration: dur, ease: "power2.inOut", overflow: "hidden" }, 0.1);

      tl.set(newContent, { overflow: "hidden" }, 0.1);
      tl.set(newInner, { opacity: 0, y: 8 }, 0.1);
      tl.to(newContent, { height: "auto", duration: dur, ease: "power2.inOut" }, 0.1);

      // Fade in new inner after height is mostly done
      tl.to(newInner, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.3);
      tl.set(newContent, { overflow: "visible" });

      prevIndex.current = activeIndex;
      setActiveIndex(newIndex);
    },
    [activeIndex],
  );

  return (
    <section
      id="mission"
      ref={sectionRef}
      className="py-10 md:py-16 px-4 sm:px-6 md:px-8 bg-white text-ink overflow-hidden relative"
    >
      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* ─── SECTION HEADER with WordRotate ─── */}
        <RevealOnScroll effect="fadeIn">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold text-[#44B8E8] uppercase tracking-widest flex items-center justify-center gap-2 mb-4">
              <span className="w-8 h-0.5 bg-[#44B8E8]" /> Why Choose Us{" "}
              <span className="w-8 h-0.5 bg-[#44B8E8]" />
            </span>
            <h2 className="mission-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-[#2D2D2D] tracking-tight max-w-3xl mx-auto">
              Engineering & <span className="text-[#44B8E8]">Quality</span> Standards
            </h2>
            <div className="mission-subtitle mt-4 flex items-center justify-center gap-2 text-lg md:text-xl text-steel">
              Built on{" "}
              <WordRotate
                words={["Precision", "Reliability", "Excellence", "Innovation"]}
                className="text-brand font-bold"
              />
            </div>
          </div>
        </RevealOnScroll>

        {/* ─── GSAP ACCORDION LIST ─── */}
        <div ref={listRef} className="accordion-list flex flex-col mb-16">
          {whyChooseUsData.map((item, index) => (
            <div key={index} className="accordion-row">
              <AccordionItem
                item={item}
                index={index}
                isActive={activeIndex === index}
                onActivate={handleActivate}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
