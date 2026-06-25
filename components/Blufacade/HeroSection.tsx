"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import * as Lucide from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useHeroSlides, type HeroSlide } from "@/hooks/use-hero-slides";

gsap.registerPlugin(useGSAP);
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Link from "next/link";
// import { Marquee } from "@/components/ui/marquee";
// import { useClientLogos } from "@/hooks/use-client-logos";

// const FALLBACK_LOGOS = [
//   { name: "Foxconn", logo: "/images/logos/foxconn.svg" },
//   { name: "Royal Enfield", logo: "/images/logos/royal-enfield.svg" },
//   { name: "Asian Paints", logo: "/images/logos/asian-paints.svg" },
//   { name: "Hyundai Mobis", logo: "/images/logos/hyundai-mobis.svg" },
//   { name: "Samsung", logo: "/images/logos/samsung.svg" },
//   { name: "Tata Motors", logo: "/images/logos/tata-motors.svg" },
//   { name: "Bosch", logo: "/images/logos/bosch.svg" },
// ];

interface Slide {
  id: string;
  imageUrl: string;
  title: string;
  highlight: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  tagline: string;
}

const staticSlides: Slide[] = [
  {
    id: "slide-1",
    imageUrl: "/images/rayzor/hero-carousel/banner-6.png",
    title: "We're India's —",
    highlight: "Packaging\nEngineers.",
    tagline:
      "Top performance requires\nmore than protection —\nespecially precision",
    description:
      "Engineering your entire packaging supply chain — from concept to container.",
    primaryCta: { label: "Explore Our Products", href: "/services" },
    secondaryCta: { label: "Get Enquiry", href: "/contact" },
  },
  {
    id: "slide-2",
    imageUrl: "/images/rayzor/hero-carousel/banner-7.png",
    title: "Performance,",
    highlight: "Protected.",
    tagline:
      "Industrial strength meets\nengineering precision —\nbuilt to endure",
    description:
      "Durable, moisture-resistant LDPE films — manufactured in-house at our Madurai facility.",
    primaryCta: { label: "View LDPE Range", href: "/services" },
    secondaryCta: { label: "Get Enquiry", href: "/contact" },
  },
  {
    id: "slide-3",
    imageUrl: "/images/rayzor/hero-carousel/banner-8.png",
    title: "Engineered",
    highlight: "For Export.",
    tagline:
      "From concept to container,\nprecision packaging\nacross the world",
    description:
      "Container liners, pallet covers, and export-grade palletization with precision.",
    primaryCta: { label: "Our Solutions", href: "/services" },
    secondaryCta: { label: "Contact Us", href: "/contact" },
  },
];

export function HeroSection() {
  const { slides: dynamicSlides } = useHeroSlides();
  // const { clientLogos: dynamicLogos } = useClientLogos();
  // const clientLogos = dynamicLogos.length > 0
  //   ? dynamicLogos.map((l: any) => ({ name: l.name, logo: l.logo }))
  //   : FALLBACK_LOGOS;

  // Map dynamic slides to Slide format, fallback to static
  const slides: Slide[] = dynamicSlides.length > 0
    ? dynamicSlides.map((s: HeroSlide, i: number) => ({
        id: `slide-${i}`,
        imageUrl: s.imageUrl,
        title: s.title,
        highlight: s.highlight,
        tagline: s.tagline,
        description: s.description,
        primaryCta: { label: s.primaryCtaLabel || "Explore Products", href: s.primaryCtaHref || "/products" },
        secondaryCta: { label: s.secondaryCtaLabel || "Contact Us", href: s.secondaryCtaHref || "/contact" },
      }))
    : staticSlides;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const autoplayRef = useRef(
    Autoplay({
      delay: 6000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: true,
    }),
  );
  const containerRef = useRef<HTMLElement>(null);

  const handleSelect = useCallback(() => {
    if (api) setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);
    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api, handleSelect]);

  // transitions.dev: text-swap orchestration for description
  const swapDescRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const slidesElements = gsap.utils.toArray(
        ".hero-slide-wrapper",
      ) as HTMLElement[];

      slidesElements.forEach((slide, index) => {
        const lines = slide.querySelectorAll(".hero-text-line");
        const cta = slide.querySelector(".hero-cta");
        const tagline = slide.querySelector(".hero-tagline");
        const stagger = slide.querySelector(".t-stagger");

        if (index === current) {
          // Active Slide: Animate IN with GSAP
          gsap.fromTo(
            lines,
            { y: "115%", opacity: 0, rotateZ: 4 },
            {
              y: "0%",
              opacity: 1,
              rotateZ: 0,
              duration: 1.2,
              stagger: 0.15,
              ease: "power4.out",
            },
          );
          gsap.fromTo(
            [cta, tagline],
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 0.6,
              stagger: 0.2,
              ease: "power3.out",
            },
          );

          // transitions.dev: texts reveal — trigger stagger entrance
          stagger?.classList.remove("is-hiding");
          stagger?.classList.add("is-shown");
        } else {
          // Inactive Slide: Reset immediately
          gsap.set(lines, { y: "115%", opacity: 0, rotateZ: 4 });
          gsap.set([cta, tagline], { y: 40, opacity: 0 });

          // transitions.dev: hide stagger text
          stagger?.classList.add("is-hiding");
          stagger?.classList.remove("is-shown");
          setTimeout(() => stagger?.classList.remove("is-hiding"), 200);
        }
      });

      // transitions.dev: text-swap on description
      const el = swapDescRef.current;
      if (el) {
        const dur =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--text-swap-dur",
            ),
          ) || 150;
        el.classList.add("is-exit");
        setTimeout(() => {
          el.textContent = slides[current].description;
          el.classList.remove("is-exit");
          el.classList.add("is-enter-start");
          void el.offsetHeight;
          el.classList.remove("is-enter-start");
        }, dur);
      }
    },
    { dependencies: [current], scope: containerRef },
  );

  return (
    <section
      id="hero-section"
      ref={containerRef}
      className="relative w-full bg-[#fcfbf9] overflow-hidden"
    >
      {/* ── HERO CAROUSEL ── */}
      <div className="relative w-full">
        <Carousel
          setApi={setApi}
          plugins={[autoplayRef.current]}
          opts={{ loop: true, duration: 30, skipSnaps: false }}
          className="w-full h-full"
        >
          <CarouselContent>
            {slides.map((s, index) => (
              <CarouselItem
                key={s.id}
                className="basis-full min-w-0 shrink-0 grow-0 hero-slide-wrapper"
              >
                {/* Viewport height minus trusted strip — both must fit in one screen */}
                <div className="relative w-full h-[calc(100svh-120px)] sm:h-[calc(100svh-110px)] lg:h-[calc(100svh-100px)] min-h-[350px]">
                  {/* ── IMAGE ── */}
                  <Image
                    src={s.imageUrl}
                    alt={s.title + " " + s.highlight}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                    priority={index === 0}
                    quality={90}
                  />

                  {/* ── Layered overlays ── */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/35 to-black/25" />
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-transparent to-black/25" />
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
                    }}
                  />

                  {/* ── CONTENT ── */}
                  <div className="absolute inset-0 z-20 flex flex-col px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-28">
                    {/* ── Main content area — vertically centered ── */}
                    <div className="flex-1 flex items-center pt-16 lg:pt-20">
                      <div className="w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8 lg:gap-16">
                        {/* ─── LEFT: Title block ─── */}
                        <div className="max-w-full sm:max-w-[85%] md:max-w-[65%] lg:max-w-[55%] 2xl:max-w-[50%]">
                          {/* transitions.dev: texts reveal wrapper */}
                          <div className="t-stagger">
                            {/* Title: first line lighter, highlight bold */}
                            <h1 className="t-stagger-line t-stagger-line--1 font-heading text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                              <div className="overflow-hidden pb-1 -mb-1">
                                <span
                                  className="block leading-[1.05] tracking-[-0.02em] hero-text-line origin-left"
                                  style={{
                                    fontSize: "clamp(1.15rem, 3.5vw, 3.5rem)",
                                    fontWeight: 400,
                                  }}
                                >
                                  {s.title}
                                </span>
                              </div>
                              <div className="mt-0.5 sm:mt-1 md:mt-2">
                                {s.highlight.split("\n").map((line, i) => (
                                  <div
                                    key={i}
                                    className="overflow-hidden pb-2 sm:pb-3 -mb-2 sm:-mb-3 pt-0.5 sm:pt-1"
                                  >
                                    <span
                                      className="block leading-[0.92] tracking-[-0.04em] hero-text-line origin-left"
                                      style={{
                                        fontSize: "clamp(2rem, 6.5vw, 6rem)",
                                        fontWeight: 800,
                                      }}
                                    >
                                      {line}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </h1>

                            {/* Description — transitions.dev: text-swap */}
                            <p className="t-stagger-line t-stagger-line--2 mt-3 sm:mt-5 md:mt-6 text-white/60 text-xs sm:text-sm md:text-base max-w-[90%] sm:max-w-md leading-relaxed">
                              <span
                                ref={
                                  index === current ? swapDescRef : undefined
                                }
                                className="t-text-swap"
                              >
                                {s.description}
                              </span>
                            </p>
                          </div>

                          {/* CTA */}
                          <div className="mt-5 sm:mt-8 md:mt-10 lg:mt-14 hero-cta">
                            <Link
                              href={s.primaryCta.href}
                              className="group/cta inline-flex items-center gap-0 text-white"
                            >
                              <span className="text-xs sm:text-sm md:text-base lg:text-[17px] font-bold tracking-tight border-b-2 sm:border-b-[2.5px] border-white/70 pb-1 sm:pb-1.5 group-hover/cta:border-[var(--brand-blue)] group-hover/cta:text-[var(--brand-blue)] transition-colors duration-300 mr-3 sm:mr-4">
                                {s.primaryCta.label}
                              </span>
                              <span className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-[1.5px] sm:border-[2px] border-white/30 flex items-center justify-center group-hover/cta:border-[var(--brand-blue)] group-hover/cta:bg-[var(--brand-blue)] transition-all duration-300 text-white/80 group-hover/cta:text-white">
                                <Lucide.ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
                              </span>
                            </Link>
                          </div>
                        </div>

                        {/* ─── RIGHT: Tagline with shimmer ─── */}
                        <div className="hidden lg:flex flex-shrink-0 max-w-[35%] xl:max-w-[30%] 2xl:max-w-[25%] justify-end pb-8 lg:pb-12 hero-tagline">
                          <div className="border-l-[2.5px] border-white/15 pl-6 xl:pl-8">
                            <p
                              className="font-heading leading-[1.3] tracking-[-0.01em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                              style={{
                                fontSize: "clamp(1rem, 1.8vw, 2rem)",
                                fontWeight: 400,
                                fontStyle: "italic",
                              }}
                            >
                              {/* transitions.dev: shimmer text on tagline */}
                              <span
                                className="t-shimmer"
                                data-text={s.tagline.replace(/\n/g, " ")}
                              >
                                {s.tagline.split("\n").map((line, i) => (
                                  <span key={i}>
                                    {line}
                                    {i < s.tagline.split("\n").length - 1 && (
                                      <br />
                                    )}
                                  </span>
                                ))}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* ── SLIDE INDICATORS — vertical right edge ── */}
        {slides.length > 1 && (
          <div className="absolute right-4 md:right-7 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-500 rounded-full ${
                  index === current
                    ? "w-2.5 h-9 bg-white shadow-[0_0_14px_rgba(255,255,255,0.35)]"
                    : "w-2.5 h-2.5 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── TRUSTED BY STRIP (Commented out) ──
      <div className="w-full bg-[#fcfbf9] border-b border-black/5 py-2 sm:py-3 lg:py-5 relative z-30 shrink-0">
        <div className="mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 flex flex-row items-center gap-3 sm:gap-6 md:gap-12">
          <div className="hidden sm:flex shrink-0 flex-col self-center">
            <h3 className="text-[#002f4b] font-heading font-black text-[12px] md:text-[15px] leading-[1.1] tracking-wide uppercase">
              Trusted By<br />Industry Leaders
            </h3>
            <div className="w-10 h-[3px] bg-[var(--brand-blue)] mt-3 rounded-full"></div>
          </div>
          <div className="flex-1 overflow-hidden min-w-0" style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}>
            <Marquee pauseOnHover className="[--duration:40s] [--gap:1rem] sm:[--gap:1.5rem]">
              {clientLogos.map((item) => (
                <div key={item.name} className="flex items-center justify-center bg-white px-3 sm:px-6 py-1 sm:py-2 rounded-md shadow-sm border border-black/5 h-[36px] sm:h-[46px] md:h-[60px] w-24 sm:w-32 md:w-36">
                  <Image src={item.logo} alt={item.name} width={100} height={32} className="max-h-5 sm:max-h-6 md:max-h-8 w-auto object-contain" />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
      */}
    </section>
  );
}
