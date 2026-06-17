"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SERVICES = [
  {
    id: "01",
    cardTitle: "Core Solutions",
    cardHeading: "Packaging Solutions",
    cardText: "We specialize in packaging for various industries, such as axles for trains, car parts, chip cards, revolving door elements, printers, EC cards, spices, hops, coffee, grand pianos, kitchen appliances, printed circuit boards, and more.",
    bgImage: "/images/rayzor/services/industrial_vci_rolls.png",
  },
  {
    id: "02",
    cardTitle: "Outsourced Efficiency",
    cardHeading: "Contract Packaging",
    cardText: "Streamline your operations with our dedicated contract packaging services. We handle the entire packaging process at our specialized facilities, allowing you to focus on your core manufacturing while we ensure international standards.",
    bgImage: "/images/rayzor/services/engineering.png",
  },
  {
    id: "03",
    cardTitle: "Global Transit",
    cardHeading: "Export Palletization",
    cardText: "Secure your cargo for international shipping. Our export palletization services utilize heavy-duty wrapping, strapping, and custom pallets to ensure maximum stability and protection against harsh transit conditions across the globe.",
    bgImage: "/images/rayzor/services/heavy_machinery_logistics.png",
  },
  {
    id: "04",
    cardTitle: "Moisture Protection",
    cardHeading: "Vacuum Packaging",
    cardText: "Advanced protection for highly sensitive equipment. By utilizing specialized barrier foils and extracting all air, we create a completely moisture-free environment that prevents corrosion during long-term storage or overseas transport.",
    bgImage: "/images/rayzor/services/vci-poly-bags.jpg",
  },
];

export function ServicesSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── ALL DEVICES: pinned scroll with card transitions ──
      mm.add("(min-width: 0px)", () => {
        const section = containerRef.current;
        if (!section) return;

        gsap.set(".card-1", { y: "100vh", opacity: 0 });
        gsap.set(".card-2", { y: "100vh", opacity: 0 });
        gsap.set(".card-3", { y: "100vh", opacity: 0 });
        gsap.set(".bg-panel-1", { opacity: 0 });
        gsap.set(".bg-panel-2", { opacity: 0 });
        gsap.set(".bg-panel-3", { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 1,
          },
        });

        // Hold Service 0
        tl.to({}, { duration: 1 });

        // Transition 0 → 1
        tl.addLabel("trans1")
          .to(".card-0", { y: "-100vh", opacity: 0, duration: 1, ease: "power2.inOut" }, "trans1")
          .to(".bg-panel-0", { opacity: 0, duration: 1, ease: "power2.inOut" }, "trans1")
          .to(".bg-panel-1", { opacity: 1, duration: 1, ease: "power2.inOut" }, "trans1")
          .to(".card-1", { y: "0vh", opacity: 1, duration: 1, ease: "power2.inOut" }, "trans1");

        // Hold Service 1
        tl.to({}, { duration: 1 });

        // Transition 1 → 2
        tl.addLabel("trans2")
          .to(".card-1", { y: "-100vh", opacity: 0, duration: 1, ease: "power2.inOut" }, "trans2")
          .to(".bg-panel-1", { opacity: 0, duration: 1, ease: "power2.inOut" }, "trans2")
          .to(".bg-panel-2", { opacity: 1, duration: 1, ease: "power2.inOut" }, "trans2")
          .to(".card-2", { y: "0vh", opacity: 1, duration: 1, ease: "power2.inOut" }, "trans2");

        // Hold Service 2
        tl.to({}, { duration: 1 });

        // Transition 2 → 3
        tl.addLabel("trans3")
          .to(".card-2", { y: "-100vh", opacity: 0, duration: 1, ease: "power2.inOut" }, "trans3")
          .to(".bg-panel-2", { opacity: 0, duration: 1, ease: "power2.inOut" }, "trans3")
          .to(".bg-panel-3", { opacity: 1, duration: 1, ease: "power2.inOut" }, "trans3")
          .to(".card-3", { y: "0vh", opacity: 1, duration: 1, ease: "power2.inOut" }, "trans3");

        // Hold Service 3
        tl.to({}, { duration: 1 });

        // Parallax on backgrounds
        gsap.to(".parallax-bg", {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=400%",
            scrub: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="relative w-full h-[100svh] bg-[#1b1c19] overflow-hidden">
      
      {/* ══════════ UNIVERSAL PINNED LAYOUT ══════════ */}
      
      {/* Background Layers */}
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-[#1b1c19]">
        {SERVICES.map((service, i) => (
          <div
            key={`bg-${service.id}`}
            className={`bg-panel-${i} absolute inset-0 w-full h-full overflow-hidden`}
            style={{ zIndex: i }}
          >
            <div className="absolute inset-0 w-full h-full scale-[1.15] origin-center">
              <Image
                src={service.bgImage}
                alt={service.cardTitle}
                fill
                sizes="100vw"
                className="parallax-bg object-cover brightness-[0.55]"
                priority={i === 0}
              />
            </div>
            {/* Darker gradient on mobile so text is legible */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#1b1c19]/95 via-[#1b1c19]/60 lg:via-[#1b1c19]/50 to-transparent" />
          </div>
        ))}
      </div>

      {/* Foreground Content — always side-by-side on desktop */}
      <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 flex flex-row items-center pointer-events-none">

        {/* Left: heading — vertically centered */}
        <div className="w-[38%] lg:w-[40%] xl:w-[42%]">
          <h2
            className="text-[#fbf9f4] font-bold tracking-tight leading-[1.1]"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 3.5rem)" }}
          >
            Our Service <br />
            <span className="text-[#1689cf]">and Sectors</span>
          </h2>
        </div>

        {/* Right: Cards — vertically centered */}
        <div className="relative w-[62%] lg:w-[60%] xl:w-[55%] h-full flex justify-end items-center">
          {SERVICES.map((service, i) => (
            <div
              key={`card-${service.id}`}
              className={`card-${i} absolute w-full max-w-[400px] lg:max-w-[440px] xl:max-w-[520px] 2xl:max-w-[580px] bg-[#fbf9f4] p-4 lg:p-6 xl:p-10 2xl:p-12 shadow-2xl pointer-events-auto`}
              style={{ zIndex: i }}
            >
              <div className="absolute top-0 right-0 w-10 h-10 lg:w-14 lg:h-14 xl:w-20 xl:h-20 bg-[#1689cf]" />
              <div className="relative z-10">
                <span
                  className="text-[#1689cf] mb-2 lg:mb-3 block font-bold uppercase tracking-wider"
                  style={{ fontSize: "clamp(0.6rem, 1vw, 1rem)" }}
                >
                  {service.cardTitle}
                </span>
                <h3
                  className="font-semibold text-[#1b1c19] leading-tight mb-2 lg:mb-4 xl:mb-6 tracking-tight"
                  style={{ fontSize: "clamp(1rem, 2.5vw, 2.5rem)" }}
                >
                  {service.cardHeading}
                </h3>
                <p
                  className="text-[#30312e] leading-relaxed font-medium"
                  style={{ fontSize: "clamp(0.6rem, 1vw, 1rem)" }}
                >
                  {service.cardText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
