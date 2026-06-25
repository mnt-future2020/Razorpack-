"use client";

import React from "react";
import Image from "next/image";
import { Lightbulb, Recycle, Award } from "lucide-react";

export function AboutBusinessAreas() {
  return (
    <section className="relative w-full py-12 md:py-14 lg:py-16 overflow-hidden bg-[var(--brand-dark)] z-20">
      {/* BACKGROUND IMAGE W/ OVERLAY */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/images/dark_industrial_texture.png"
          alt="Dark Industrial Background"
          fill
          className="object-cover object-center opacity-20 mix-blend-overlay"
        />
        {/* Brand dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-dark)] to-[#0a1118]" />
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-start">
        {/* LEFT COLUMN: Large Heading */}
        <div className="w-full md:w-[45%] lg:w-[40%] pr-8 lg:pr-16 mb-16 md:mb-0 relative">
          <div className="md:sticky md:top-40">
            <h2 className="font-heading font-light text-[clamp(3rem,6vw,5.5rem)] leading-[1.1] tracking-tight text-white">
              What truly <br />
              <span className="italic">matters to us</span>
            </h2>
          </div>
        </div>

        {/* VERTICAL DIVIDER */}
        <div className="hidden md:block w-[1px] bg-white/10 self-stretch mx-4" />

        {/* RIGHT COLUMN: Values List */}
        <div className="w-full md:w-[55%] lg:w-[60%] md:pl-12 lg:pl-20 flex flex-col">
          {/* VALUE 1: Innovation */}
          <div className="flex gap-6 lg:gap-10">
            <div className="shrink-0 mt-2">
              <Lightbulb
                className="w-10 h-10 lg:w-14 lg:h-14 text-[var(--brand-blue)]"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-heading text-3xl lg:text-4xl text-white font-light mb-4 tracking-tight">
                Tailor-Made Solutions
              </h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-[500px] font-light">
                Whether on the phone or on-site, our dedicated team collaborates
                with you, providing fast and optimal solutions for your packaging
                needs. We specialize in VCI Film Rolls, LDPE Film Rolls, Pallet
                Covers, Container Liners, and more — all crafted in-house.
              </p>
            </div>
          </div>

          {/* HORIZONTAL DIVIDER */}
          <div className="w-full h-[1px] bg-white/10 my-12" />

          {/* VALUE 2: Quality */}
          <div className="flex gap-6 lg:gap-10">
            <div className="shrink-0 mt-2">
              <Award
                className="w-10 h-10 lg:w-14 lg:h-14 text-[var(--brand-blue)]"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-heading text-3xl lg:text-4xl text-white font-light mb-4 tracking-tight">
                Premium Quality
              </h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-[500px] font-light">
                Meticulously crafted from high-quality materials, our bags offer
                protection against moisture, gases, and leaks. Our strict quality
                standards, certifications, and reliable suppliers ensure every
                product meets the highest global benchmarks.
              </p>
            </div>
          </div>

          {/* HORIZONTAL DIVIDER */}
          <div className="w-full h-[1px] bg-white/10 my-12" />

          {/* VALUE 3: Sustainability */}
          <div className="flex gap-6 lg:gap-10">
            <div className="shrink-0 mt-2">
              <Recycle
                className="w-10 h-10 lg:w-14 lg:h-14 text-[var(--brand-blue)]"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-heading text-3xl lg:text-4xl text-white font-light mb-4 tracking-tight">
                Made in India
              </h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-[500px] font-light">
                Our production hub in Madurai, Tamil Nadu stands as a testament to
                our commitment to precision and quality. In-house production with
                flexibility and reliability, contributing to the &quot;Made in India&quot;
                legacy with distinctive custom-printed packaging options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
