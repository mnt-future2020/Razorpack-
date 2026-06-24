"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Factory } from "lucide-react"

const slides = [
  {
    tag: "VCI / Anti-Corrosion",
    title: "PROTECTION,\nENGINEERED.",
    description:
      "Tailor-made VCI films under the Rustoxy brand shield automotive, electronics and food-industry components from corrosion — no oiling required.",
    image:
      "/images/rayzor/hero-carousel/Gemini_Generated_Image_trp8hltrp8hltrp8.png",
    alt: "VCI anti-corrosion film roll by Rayzor Industrial Packaging Pvt Ltd",
    cta: { label: "send us!", href: "/contact" },
    partners: [
      { name: "Foxconn", role: "Electronics OEM" },
      { name: "Royal Enfield", role: "Automotive OEM" },
      { name: "Asian Paints", role: "Industrial Partner" },
    ],
  },
  {
    tag: "LDPE / Flexible Films",
    title: "CERTIFIED\nLDPE FILMS.",
    description:
      "Durable, moisture-resistant film rolls, pouches, bags and sheets — manufactured in-house at our Madurai facility for over two decades.",
    image:
      "/images/rayzor/hero-carousel/Gemini_Generated_Image_i2qvi0i2qvi0i2qv.png",
    alt: "LDPE pallet wrap on wooden pallet by Rayzor Industrial Packaging Pvt Ltd",
    cta: { label: "send us!", href: "/contact" },
    partners: [
      { name: "Mobis", role: "Automotive OEM" },
      { name: "Kajaria", role: "Ceramics" },
      { name: "Dixon", role: "Electronics" },
    ],
  },
  {
    tag: "VCI Bags & Pouches",
    title: "SHIELD\nEVERY PART.",
    description:
      "Custom-sized VCI bags and pouches for precision metal components — gears, bearings, shafts — sealed protection from the factory floor to delivery.",
    image:
      "/images/rayzor/hero-carousel/Gemini_Generated_Image_arhtk8arhtk8arht.png",
    alt: "VCI bags protecting metal automotive parts",
    cta: { label: "send us!", href: "/contact" },
    partners: [
      { name: "Amara Raja", role: "Battery OEM" },
      { name: "Foxconn", role: "Electronics OEM" },
      { name: "Royal Enfield", role: "Automotive OEM" },
    ],
  },
]

const productCards = [
  {
    image:
      "/images/rayzor/hero-carousel/Gemini_Generated_Image_trp8hltrp8hltrp8.png",
    name: "VCI Film Rolls",
    desc: "Anti-corrosion protection under the Rustoxy brand.",
    href: "/services",
    color: "bg-brand",
  },
  {
    image:
      "/images/rayzor/hero-carousel/Gemini_Generated_Image_i2qvi0i2qvi0i2qv.png",
    name: "LDPE Pallet Wrap",
    desc: "Heavy-duty moisture-resistant industrial film.",
    href: "/services",
    color: "bg-amber",
    featured: true,
  },
  {
    image:
      "/images/rayzor/hero-carousel/Gemini_Generated_Image_arhtk8arhtk8arht.png",
    name: "VCI Bags & Pouches",
    desc: "Sealed corrosion protection for metal parts.",
    href: "/services",
    color: "bg-brand-deep",
  },
]

export default function Hero02() {
  const [current, setCurrent] = React.useState(0)
  const timerRef = React.useRef<ReturnType<typeof setInterval>>(null)
  const slide = slides[current]

  const next = React.useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    []
  )
  const prev = React.useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  )

  React.useEffect(() => {
    timerRef.current = setInterval(next, 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [next])

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(next, 6000)
  }

  return (
    <section className="relative bg-surface overflow-hidden">
      {/* ─── DECORATIVE BACKGROUND RINGS (like the reference) ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large ring top-right */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full border-[40px] border-brand/[0.06]" />
        {/* Medium ring center-right */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[10%] w-[500px] h-[500px] rounded-full border-[30px] border-brand/[0.04]" />
        {/* Small ring bottom-left */}
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full border-[25px] border-brand/[0.05]" />
      </div>

      {/* ─── MAIN HERO CONTENT ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-32 md:pb-40 lg:pb-44">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 items-center min-h-[560px]">

          {/* COL 1 — Vertical nav: dots + counter + arrows (far left, like reference) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-3 self-center">
            <div className="flex flex-col items-center gap-2 mb-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => { setCurrent(i); resetTimer() }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-brand w-2.5 h-2.5"
                      : "bg-line hover:bg-steel"
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-steel tabular-nums tracking-wide">
              {current + 1}/{slides.length}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => { prev(); resetTimer() }}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-steel hover:bg-brand hover:text-white hover:border-brand transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => { next(); resetTimer() }}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-steel hover:bg-brand hover:text-white hover:border-brand transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* COL 2 — Headline (massive, left-aligned, like "CRUNCH INTO FLAVOR BLISS") */}
          <div className="lg:col-span-4 flex flex-col items-start justify-center">
            <h1
              key={slide.title}
              className="text-[clamp(2.5rem,6vw,4.5rem)] font-heading font-extrabold tracking-[-0.03em] text-ink leading-[1.0] whitespace-pre-line mb-8 transition-opacity duration-500"
            >
              {slide.title}
            </h1>
            <Link
              href={slide.cta.href}
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-7 py-3 rounded-full hover:bg-brand-deep transition-colors"
            >
              {slide.cta.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* COL 3 — Center floating product image (large, like the Lays bag) */}
          <div className="lg:col-span-4 flex items-center justify-center relative py-8 lg:py-0">
            <div className="relative z-10 w-full lg:w-[140%] lg:-mx-[20%]">
              {/* Soft radial glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-brand/8 rounded-full blur-3xl -z-10" />
              <img
                key={slide.image}
                alt={slide.alt}
                src={slide.image}
                className="h-auto w-full max-h-[520px] object-contain drop-shadow-xl transition-all duration-500 mx-auto"
              />
            </div>
          </div>

          {/* COL 4 — Right side: description text + partner avatars (like the reviews) */}
          <div className="lg:col-span-3 flex flex-col justify-center gap-6 lg:pl-4">
            <p
              key={slide.description}
              className="text-sm text-steel leading-relaxed transition-opacity duration-500"
            >
              {slide.description}
            </p>
            <div className="flex flex-col gap-3.5">
              {slide.partners.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center shadow-sm">
                    <Factory className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-ink leading-tight">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-steel">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => { prev(); resetTimer() }}
            className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-steel hover:bg-brand hover:text-white hover:border-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setCurrent(i); resetTimer() }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current ? "bg-brand scale-125" : "bg-line"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => { next(); resetTimer() }}
            className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-steel hover:bg-brand hover:text-white hover:border-brand transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── PRODUCT CARDS STRIP (overlapping hero bottom, like the reference) ─── */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 md:px-12 -mt-20 md:-mt-24 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {productCards.map((card) => (
            <Link
              key={card.name}
              href={card.href}
              className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                card.featured
                  ? "border-brand shadow-md md:scale-105 md:z-10"
                  : "border-line shadow-sm"
              }`}
            >
              {/* Card image area */}
              <div className="relative h-36 bg-gradient-to-br from-surface to-surface-dim flex items-center justify-center overflow-hidden">
                <img
                  src={card.image}
                  alt={card.name}
                  className="h-28 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card content */}
              <div className="px-4 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink truncate">
                    {card.name}
                  </p>
                  <p className="text-xs text-steel truncate mt-0.5">
                    {card.desc}
                  </p>
                </div>
                <span
                  className={`shrink-0 w-9 h-9 ${card.color} rounded-lg flex items-center justify-center`}
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
