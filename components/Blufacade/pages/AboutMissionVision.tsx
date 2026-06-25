"use client"

import React, { useRef } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const CARDS = [
  {
    id: "who-we-are",
    number: "01",
    title: "Who We Are",
    description: "Welcome to Rayzor Industrial Packaging Pvt Ltd, where expertise meets innovation. For over two decades, we've been the driving force behind tailor-made packaging solutions. Our production hub in Madurai, Tamil Nadu, India, stands as a testament to our commitment to precision and quality.",
    bgColor: "bg-[#111827]", // Deep Charcoal
    bgImage: "/images/card_bg_dark.png",
  },
  {
    id: "specialized-range",
    number: "02",
    title: "Specialized Range",
    description: "Specializing in VCI Film Rolls, VCI Pouch, VCI Bags, VCI Sheet, LDPE Film Rolls, LDPE Pouch, LDPE Bags, LDPE Sheet, Pallet Covers and Container Liner bags, we cater to diverse industries, ensuring your products receive packaging that not only protects but enhances their value.",
    bgColor: "bg-[#6b7280]", // Neutral Grey
    bgImage: "/images/card_bg_grey.png",
  },
  {
    id: "quality-collaboration",
    number: "03",
    title: "Quality & Collaboration",
    description: "Our in-house production, coupled with strict quality standards, certifications, and reliable suppliers, ensures flexibility and reliability. Whether on the phone or on-site, our dedicated team collaborates with you, providing fast and optimal solutions for your packaging needs.",
    bgColor: "bg-[var(--brand-blue)]", // Brand blue
    bgImage: "/images/card_bg_orange.png",
  },
]

export function AboutMissionVision() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return


      const cards = gsap.utils.toArray<HTMLElement>(".mission-card")

      // 1. Set initial hidden state BEFORE ScrollTrigger fires
      //    GSAP captures this as the "from" state so reverse works correctly
      gsap.set(cards, { rotateY: 90, opacity: 0, transformPerspective: 1200 })
      gsap.set(".card-content", { opacity: 0, y: 20 })

      // 2. Master timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          end: "bottom 50%",
          scrub: 2,
        }
      })

      // 3. Animate each card and its text to visible state
      //    On reverse, GSAP will go back to the gsap.set() state above
      cards.forEach((card, index) => {
        const startTime = index * 0.25

        tl.to(
          card,
          { rotateY: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
          startTime
        )

        const contents = Array.from(card.querySelectorAll(".card-content"))
        contents.forEach((el, i) => {
          tl.to(
            el,
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            startTime + 0.35 + i * 0.12
          )
        })
      })
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} className="w-full bg-white py-20 lg:py-32 font-sans overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12">
        {/* ── SECTION HEADER ── */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight whitespace-nowrap">
            <span className="text-[var(--brand-dark)]">Our Mission & </span><span className="text-[var(--brand-blue)]">Vision</span>
          </h2>
        </div>

        {/* ── 3-COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {CARDS.map((card) => (
            <div 
              key={card.id}
              className={`mission-card relative w-full h-[550px] lg:h-[650px] overflow-hidden flex flex-col p-8 lg:p-12 ${card.bgColor}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              
              {/* Content (Top Left) */}
              <div className="relative z-20 flex flex-col text-white max-w-[90%]">
                <h3 className="card-content text-2xl lg:text-[1.75rem] font-bold mb-6 tracking-tight">
                  {card.title}
                </h3>
                <p className="card-content text-[0.95rem] lg:text-base leading-relaxed text-white/90 font-medium">
                  {card.description}
                </p>
              </div>

              {/* Large Number (Bottom Right) */}
              <div className="absolute bottom-6 right-8 z-20">
                <span className="card-content block text-white text-5xl lg:text-6xl font-bold tracking-tighter opacity-90">
                  {card.number}
                </span>
              </div>

              {/* Faded Background Graphic (Bottom Half) */}
              <div 
                className="absolute bottom-0 left-0 w-full h-[60%] pointer-events-none z-10 opacity-70 mix-blend-overlay"
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 100%)",
                }}
              >
                <Image 
                  src={card.bgImage}
                  alt="Industrial Graphic Background"
                  fill
                  className="object-cover object-bottom grayscale"
                />
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  )
}
