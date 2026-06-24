"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useContact } from "@/hooks/use-contact";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Footer() {
  const containerRef = useRef<HTMLElement>(null);
  const { settings } = useSettings();
  const { contactInfo } = useContact();

  useGSAP(() => {
    const section = containerRef.current;
    if (!section) return;

    const pContainer = section.querySelector(".parallax-container");
    const pContent = section.querySelector(".parallax-content");
    if (!pContainer || !pContent) return;

    // Delay to let sticky sections calculate first
    setTimeout(() => {
      gsap.fromTo(pContent,
        { yPercent: -100 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: pContainer,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
      ScrollTrigger.refresh();
    }, 300);
  }, { scope: containerRef });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={containerRef} className="relative w-full z-0">
      
      {/* ─── WHITE FOOTER SECTION ─── */}
      <div className="relative z-10 w-full bg-white px-6 py-12 md:px-12 md:py-20 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
        
        <div className="max-w-[1600px] mx-auto w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20 lg:mb-28">
            
            {/* Left Column: Contact Us */}
            <div className="md:col-span-6 lg:col-span-5">
              <h3 className="text-[#a1a1aa] text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-2 md:mb-4">
                Talk to us about your project
              </h3>
              <Link 
                href="/contact" 
                className="inline-block text-[#1b1c19] text-5xl md:text-6xl lg:text-[5rem] font-bold tracking-tighter underline decoration-[3px] md:decoration-[5px] underline-offset-[8px] md:underline-offset-[16px] hover:text-[var(--brand-blue)] transition-colors"
              >
                Contact us
              </Link>
            </div>

            {/* Middle Column: Links */}
            <div className="md:col-span-3 lg:col-span-3 flex flex-col gap-3 lg:gap-4 md:pl-10">
              <Link href="/" className="text-[#1b1c19] text-base md:text-lg font-medium hover:text-[var(--brand-blue)] transition-colors">Home</Link>
              <Link href="/about" className="text-[#1b1c19] text-base md:text-lg font-medium hover:text-[var(--brand-blue)] transition-colors">About Us</Link>
              <Link href="/products" className="text-[#1b1c19] text-base md:text-lg font-medium hover:text-[var(--brand-blue)] transition-colors">Products</Link>
              <Link href="/services" className="text-[#1b1c19] text-base md:text-lg font-medium hover:text-[var(--brand-blue)] transition-colors">Services</Link>
              <Link href="/gallery" className="text-[#1b1c19] text-base md:text-lg font-medium hover:text-[var(--brand-blue)] transition-colors">Gallery</Link>
            </div>

            {/* Right Column: Contact Info */}
            <div className="md:col-span-3 lg:col-span-4 flex flex-col gap-5 lg:gap-6">
              
              <div className="flex gap-4">
                <span className="font-bold text-[#1b1c19] w-4 mt-0.5">L</span>
                <p className="text-[#1b1c19] font-medium text-sm md:text-base leading-snug">
                  {contactInfo?.address || "No: 298 A1, M.M Nagar, Thiruppalai"}
                  {contactInfo?.city ? <><br/>{contactInfo.city} - {contactInfo.postcode || ""}</> : <><br/>Madurai - 625014</>}
                  {contactInfo?.state ? <><br/>{contactInfo.state}, {contactInfo.country || "India"}</> : <><br/>Tamil Nadu, India</>}
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <span className="font-bold text-[#1b1c19] w-4">P</span>
                <a href={`tel:${contactInfo?.primaryPhone || "+919087787879"}`} className="text-[#1b1c19] font-medium text-sm md:text-base hover:text-[var(--brand-blue)] transition-colors">
                  {contactInfo?.primaryPhone || "+91 90877 87879"}
                </a>
              </div>

              <div className="flex gap-4 items-center">
                <span className="font-bold text-[#1b1c19] w-4">E</span>
                <a href={`mailto:${contactInfo?.email || "sales@rayzorpack.com"}`} className="text-[#1b1c19] font-medium text-sm md:text-base hover:text-[var(--brand-blue)] transition-colors">
                  {contactInfo?.email || "sales@rayzorpack.com"}
                </a>
              </div>

            </div>

          </div>

          {/* Bottom Row of White Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-t border-[#e4e4e7] pt-8 lg:pt-10">
            
            <div className="md:col-span-3 lg:col-span-4">
              <span className="text-[#1b1c19] font-bold text-sm md:text-base">Subscribe to our newsletter</span>
            </div>

            <div className="md:col-span-4 lg:col-span-4">
              <div className="flex items-center border-b border-[#a1a1aa] pb-2 group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-transparent outline-none w-full text-[#1b1c19] text-sm md:text-base placeholder:text-[#a1a1aa]"
                />
                <button className="text-[#1b1c19] group-hover:translate-x-2 transition-transform">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2 text-center md:text-center">
              <button onClick={scrollToTop} className="text-[#a1a1aa] font-medium text-sm md:text-base hover:text-[#1b1c19] transition-colors">
                Back to top
              </button>
            </div>

            <div className="md:col-span-3 lg:col-span-2 text-center md:text-right">
              <span className="text-[#1b1c19] font-medium text-sm md:text-base">Instagram, Linkedin</span>
            </div>

          </div>

        </div>

      </div>

      {/* ─── BLACK PARALLAX REVEAL SECTION ─── */}
      <div className="parallax-container relative w-full overflow-hidden z-0 bg-[#0a1118]">
        <div className="parallax-content relative w-full flex flex-col justify-end p-6 md:p-8 lg:p-12 pb-4 md:pb-6 pt-16 md:pt-24 lg:pt-32">
          
          {/* Stationary Background Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-20"
            style={{ backgroundImage: 'url("/images/rayzor/footer_bg.png")' }}
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 w-full h-full bg-[#0a1118]/85 -z-10" />

             {/* Massive Typography matching Logo Colors */}
             <h1 className="text-[12vw] lg:text-[13vw] font-black tracking-[-0.06em] leading-none w-full text-center opacity-95 mb-1 uppercase" style={{ transform: "scaleY(1.2)" }}>
               {(() => {
                 const name = settings?.siteName || "RAYZORPACK";
                 const accent = settings?.siteNameAccent || "PACK";
                 const upperName = name.toUpperCase();
                 const upperAccent = accent.toUpperCase();
                 const idx = upperName.lastIndexOf(upperAccent);
                 if (idx > 0) {
                   return (
                     <>
                       <span className="text-white">{upperName.slice(0, idx)}</span>
                       <span className="text-[var(--brand-blue)]">{upperName.slice(idx)}</span>
                     </>
                   );
                 }
                 return <span className="text-white">{upperName}</span>;
               })()}
             </h1>

          {/* Very Bottom Copyright Links */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center text-[#a1a1aa] text-xs md:text-sm gap-4">
            <span>All rights reserved © {settings?.siteName || "Rayzor Industrial Packaging Pvt Ltd"} {new Date().getFullYear()}</span>
            <div className="flex gap-6 md:gap-8">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of services</Link>
            </div>
            <span>Website by MNT</span>
          </div>

        </div>
      </div>

    </footer>
  );
}
