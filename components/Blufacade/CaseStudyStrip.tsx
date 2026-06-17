"use client"

import Link from "next/link"
import Image from "next/image"
import * as Lucide from "lucide-react"
import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Marquee } from "@/components/ui/marquee"
import { BorderBeam } from "@/components/ui/border-beam"
import { RevealOnScroll } from "@/components/gsap/reveal-on-scroll"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const clientLogos = [
  { name: "Foxconn", logo: "/images/logos/foxconn.svg" },
  { name: "Royal Enfield", logo: "/images/logos/royal-enfield.svg" },
  { name: "Asian Paints", logo: "/images/logos/asian-paints.svg" },
  { name: "Hyundai Mobis", logo: "/images/logos/hyundai-mobis.svg" },
  { name: "Samsung", logo: "/images/logos/samsung.svg" },
  { name: "Tata Motors", logo: "/images/logos/tata-motors.svg" },
  { name: "Bosch", logo: "/images/logos/bosch.svg" },
]

export function CaseStudyStrip() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        [".bento-header", ".bento-item"],
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            end: "top 35%",
            scrub: 1,
          },
        }
      )

      gsap.to(".parallax-bg", {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-container",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="overflow-hidden pb-10 md:pb-16 pt-4 md:pt-8 relative"
    >

      {/* ─── HEADER ─── */}
      <div className="bento-header px-6 md:px-10 pb-10 md:pb-12 text-center relative z-10">
        <RevealOnScroll effect="fadeIn">
          <span className="inline-block text-xs font-bold text-[#44B8E8] uppercase tracking-widest mb-4 border border-[#44B8E8]/30 px-3 py-1 rounded-md">
            About Us
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold tracking-tight max-w-4xl mx-auto text-[#2D2D2D]">
            Rayzor Industrial Packaging
          </h2>
          <p className="text-steel text-sm sm:text-base md:text-lg lg:text-xl mt-4 md:mt-6 max-w-2xl mx-auto leading-relaxed font-medium px-2 sm:px-0">
            20+ years of precision packaging engineering for automotive, electronics, and manufacturing OEMs — made in Madurai
          </p>
        </RevealOnScroll>
      </div>

      <div className="px-4 md:px-8 pb-8 md:pb-12 max-w-screen-2xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

          {/* ── FEATURED CASE STUDY (spans 8 cols) ── */}
          <div className="bento-item lg:col-span-8 group relative overflow-hidden rounded-2xl md:rounded-4xl min-h-80 sm:min-h-100 md:min-h-130 lg:min-h-180 border border-line/45 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-xl">
            {/* Parallax image */}
            <div className="parallax-container absolute inset-0">
              <div className="parallax-bg absolute inset-[-20%] group-hover:scale-105 transition-transform duration-700 ease-out">
                <Image
                  src="/images/rayzor/case-study/case-study-bg.png"
                  alt="Rayzor Industrial Packaging manufacturing facility"
                  fill
                  className="object-cover object-center filter brightness-95"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            </div>
            {/* Dark overlay — uniform for text readability */}
            <div className="absolute inset-0 bg-black/55 z-10" />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 sm:p-8 md:p-10 lg:p-14">
              <span className="inline-block px-3 py-1.5 mb-3 md:mb-6 w-fit rounded-md bg-brand text-white text-[10px] md:text-xs font-bold uppercase tracking-widest">
                Our Story
              </span>
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight max-w-2xl mb-3 md:mb-6" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                20+ years of <span className="text-brand">precision packaging</span> from Madurai to the world.
              </h2>
              <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mb-4 md:mb-8 hidden sm:block">
                Rayzor Industrial Packaging — the leading manufacturer of VCI anti-corrosion films, LDPE products, and specialty packaging.
              </p>
              <Link
                href="/about"
                className="flex w-fit items-center gap-2 bg-brand text-white text-xs md:text-sm font-bold px-5 md:px-7 py-2.5 md:py-3.5 rounded-md hover:bg-brand-deep transition-colors group/btn"
              >
                Learn more
                <Lucide.ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1.5 transition-transform" />
              </Link>
            </div>
            <BorderBeam size={250} duration={8} colorFrom="#1689cf" colorTo="#feb234" />
          </div>

          {/* ── RIGHT COLUMN (spans 4 cols, 2 stacked cards) ── */}
          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
            {/* Stat: 20+ Years */}
            <div className="bento-item relative flex-1 flex flex-col justify-between items-center rounded-[2rem] p-10 text-center overflow-hidden border border-line/45 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group min-h-72 md:min-h-85">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/rayzor/why-choose-us/quality.png"
                  alt="Precision engineering quality control"
                  fill
                  className="object-cover object-center filter brightness-[0.35] contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40 z-10" />

              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white mb-4 group-hover:scale-110 transition-transform duration-300 relative z-20">
                <Lucide.Calendar className="w-7 h-7 text-brand" />
              </div>
              <div className="flex flex-col items-center relative z-20">
                <p className="text-7xl md:text-8xl font-heading font-extrabold tracking-tight flex items-baseline select-none text-white">
                  <NumberTicker
                    value={20}
                    className="text-7xl md:text-8xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent"
                  />
                  <span className="text-brand font-extrabold">+</span>
                </p>
                <p className="text-base font-bold uppercase tracking-wider text-white mt-4">
                  Years of Excellence
                </p>
                <p className="text-xs md:text-sm text-neutral-300 mt-2 leading-relaxed max-w-[240px]">
                  In-house manufacturing & state-of-the-art laboratory testing
                </p>
              </div>
              <BorderBeam size={120} duration={8} colorFrom="#1689cf" colorTo="#feb234" />
            </div>

            {/* Stat: 16 Product Lines */}
            <div className="bento-item relative flex-1 flex flex-col justify-between items-center rounded-[2rem] p-10 text-center overflow-hidden border border-line/45 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group min-h-72 md:min-h-85">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/rayzor/why-choose-us/vci.png"
                  alt="VCI rust protection & polymer products"
                  fill
                  className="object-cover object-center filter brightness-[0.35] contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40 z-10" />

              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white mb-4 group-hover:scale-110 transition-transform duration-300 relative z-20">
                <Lucide.Layers className="w-7 h-7 text-brand" />
              </div>
              <div className="flex flex-col items-center relative z-20">
                <p className="text-7xl md:text-8xl font-heading font-extrabold tracking-tight select-none text-white">
                  <NumberTicker
                    value={16}
                    className="text-7xl md:text-8xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent"
                  />
                </p>
                <p className="text-base font-bold uppercase tracking-wider text-white mt-4">
                  Product Lines
                </p>
                <p className="text-xs md:text-sm text-neutral-300 mt-2 leading-relaxed max-w-[240px]">
                  VCI rust protection, heavy-duty LDPE & specialty polymers
                </p>
              </div>
              <BorderBeam size={120} duration={10} colorFrom="#feb234" colorTo="#1689cf" />
            </div>
          </div>

          {/* ── BOTTOM ROW: 3 feature cards (spans 4 cols each) ── */}
          {/* Card 1: VCI Corrosion Prevention */}
          <div className="bento-item lg:col-span-4 relative flex flex-col justify-between rounded-xl md:rounded-2xl bg-white border border-line/35 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden min-h-[340px] md:min-h-[420px] lg:min-h-[480px] group">
            <div className="p-5 md:p-8 flex flex-col flex-1 justify-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-neutral-100 flex items-center justify-center text-ink mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300">
                <Lucide.ShieldCheck className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-base md:text-xl lg:text-2xl font-sans font-bold text-ink mb-2 md:mb-3 tracking-tight">
                VCI Corrosion Prevention
              </h3>
              <p className="text-xs md:text-sm text-steel mb-4 md:mb-6 leading-relaxed font-light">
                Advanced anti-corrosion VCI poly bags, sheets, and emitters designed to shield metal and automotive components from rust.
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold text-ink inline-flex items-center gap-1.5 border-b border-ink/20 pb-0.5 w-fit hover:border-ink transition-colors"
              >
                Learn more
                <Lucide.ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <div className="relative w-full h-36 md:h-48 lg:h-52 mt-auto overflow-hidden">
              <Image
                src="/images/rayzor/case-study/about-solutions.png"
                alt="VCI corrosion prevention packaging"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* Card 2: LDPE Film & Sheet Rolls */}
          <div className="bento-item lg:col-span-4 relative flex flex-col justify-between rounded-xl md:rounded-2xl bg-white border border-line/35 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden min-h-[340px] md:min-h-[420px] lg:min-h-[480px] group">
            <div className="p-5 md:p-8 flex flex-col flex-1 justify-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-neutral-100 flex items-center justify-center text-ink mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300">
                <Lucide.Layers className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-base md:text-xl lg:text-2xl font-sans font-bold text-ink mb-2 md:mb-3 tracking-tight">
                LDPE Film & Sheet Rolls
              </h3>
              <p className="text-xs md:text-sm text-steel mb-4 md:mb-6 leading-relaxed font-light">
                Premium quality, high-strength LDPE film rolls and poly bags custom extruded for heavy industrial manufacturing.
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold text-ink inline-flex items-center gap-1.5 border-b border-ink/20 pb-0.5 w-fit hover:border-ink transition-colors"
              >
                Learn more
                <Lucide.ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <div className="relative w-full h-36 md:h-48 lg:h-52 mt-auto overflow-hidden">
              <Image
                src="/images/rayzor/case-study/about-facilities.png"
                alt="LDPE film extrusion facilities"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* Card 3: Secure Pallet Wrapping */}
          <div className="bento-item lg:col-span-4 relative flex flex-col justify-between rounded-xl md:rounded-2xl bg-white border border-line/35 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden min-h-[340px] md:min-h-[420px] lg:min-h-[480px] group">
            <div className="p-5 md:p-8 flex flex-col flex-1 justify-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-neutral-100 flex items-center justify-center text-ink mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300">
                <Lucide.Boxes className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-base md:text-xl lg:text-2xl font-sans font-bold text-ink mb-2 md:mb-3 tracking-tight">
                Secure Pallet Wrapping
              </h3>
              <p className="text-xs md:text-sm text-steel mb-4 md:mb-6 leading-relaxed font-light">
                High-cling industrial stretch films, bubble cushioning, and custom transit wrapping to ensure zero-defect deliveries.
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold text-ink inline-flex items-center gap-1.5 border-b border-ink/20 pb-0.5 w-fit hover:border-ink transition-colors"
              >
                Learn more
                <Lucide.ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <div className="relative w-full h-36 md:h-48 lg:h-52 mt-auto overflow-hidden">
              <Image
                src="/images/rayzor/case-study/about-logistics.png"
                alt="Secure transit pallet wrapping logistics"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
