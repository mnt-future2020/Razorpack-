"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as Lucide from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function UniqueSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  // transitions.dev: avatar group hover — spring-lift on bento cards
  const setShifts = useCallback((activeIdx: number | null, phase: "in" | "out") => {
    if (!bentoRef.current) return;
    const cs = getComputedStyle(document.documentElement);
    const num = (name: string, fb: number) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fb;
    };
    const ease = (name: string, fb: string) =>
      cs.getPropertyValue(name).trim() || fb;

    const lift    = num("--avatar-lift", -6);
    const falloff = num("--avatar-falloff", 0.45);
    const scale   = num("--avatar-scale", 1.03);
    const tf      = phase === "out"
      ? ease("--avatar-ease-out", "cubic-bezier(0.34, 3.85, 0.64, 1)")
      : ease("--avatar-ease-in",  "cubic-bezier(0.22, 1, 0.36, 1)");

    bentoRef.current.querySelectorAll<HTMLElement>(".t-avatar").forEach((el, i) => {
      el.style.transitionTimingFunction = tf;
      if (activeIdx == null) {
        el.style.setProperty("--shift", "0px");
        el.style.setProperty("--scale-active", "1");
        return;
      }
      const d = Math.abs(i - activeIdx);
      el.style.setProperty(
        "--shift",
        (lift * Math.pow(falloff, d)).toFixed(3) + "px"
      );
      el.style.setProperty(
        "--scale-active",
        i === activeIdx ? String(scale) : "1"
      );
    });
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── MOBILE / TABLET: scroll-reveal animations (NO pin) ──
      mm.add("(max-width: 1023px)", () => {
        const section = containerRef.current;
        if (!section) return;

        gsap.from(section.querySelector(".mob-heading"), {
          y: 30, opacity: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%" },
        });
        gsap.from(section.querySelector(".mob-image"), {
          y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 65%" },
        });
        gsap.from(section.querySelectorAll(".mob-card"), {
          y: 40, opacity: 0, stagger: 0.12, duration: 0.6, ease: "power3.out",
          scrollTrigger: { trigger: section.querySelector(".mob-cards"), start: "top 85%" },
        });
      });

      // ── DESKTOP: pinned scroll animation ──
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=200%",
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
            onEnter: () => {
              containerRef.current?.querySelector(".t-stagger")?.classList.add("is-shown");
            },
            onLeaveBack: () => {
              const stagger = containerRef.current?.querySelector(".t-stagger");
              stagger?.classList.add("is-hiding");
              stagger?.classList.remove("is-shown");
              setTimeout(() => stagger?.classList.remove("is-hiding"), 200);
            },
          },
        });

        // 0. Letters stagger reveal
        const chars = containerRef.current?.querySelectorAll(".about-char");
        if (chars && chars.length > 0) {
          gsap.set(chars, { opacity: 0, y: 50, rotateX: -90, scale: 0.8 });
          tl.to(chars, {
            opacity: 1, y: 0, rotateX: 0, scale: 1,
            stagger: 0.015, duration: 0.3, ease: "back.out(1.5)",
          }, 0);
        }

        // 1. Text slides from right to left + up
        const startX = window.innerWidth < 1280 ? "50vw" : "74vw";
        tl.fromTo(textRef.current,
          { x: startX, y: "0%" },
          { x: "2vw", y: "-50%", duration: 1, ease: "power1.inOut" },
          0
        );

        // 2. Image shrinks and aligns left
        tl.fromTo(imageRef.current,
          { width: "95%", marginLeft: "2.5%", borderTopLeftRadius: "32px", borderTopRightRadius: "32px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px" },
          { width: "38%", marginLeft: "0%", borderBottomRightRadius: "32px", borderTopLeftRadius: "0px", duration: 1, ease: "power2.inOut" },
          0
        );

        // 3. Cards panel reveal
        tl.fromTo(cardsContainerRef.current,
          { opacity: 0, y: 80 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
            onComplete: () => { cardsContainerRef.current?.setAttribute("data-open", "true"); },
          },
          0.2
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative w-full bg-white overflow-x-clip">

      {/* ══════════ MOBILE / TABLET (< 1024px) ══════════ */}
      <div className="lg:hidden py-10 sm:py-14 md:py-20 px-4 sm:px-6 md:px-8">
        <div className="mob-heading mb-5 sm:mb-8">
          <span className="text-[10px] sm:text-xs font-bold text-[var(--brand-blue)] uppercase tracking-[0.2em] mb-2 block">About Us</span>
          <h2 className="font-heading font-extrabold tracking-tight leading-[1.05]" style={{ fontSize: "clamp(1.6rem, 5.5vw, 2.8rem)" }}>
            <span className="text-[var(--brand-dark)]">What Makes Us </span>
            <span className="text-[var(--brand-blue)]">Unique</span>
          </h2>
        </div>

        <div className="mob-image relative w-full aspect-video rounded-xl overflow-hidden mb-5 sm:mb-8">
          <Image src="/images/rayzor/about/unique-hero.png" alt="Rayzor Industrial Packaging Pvt Ltd Manufacturing" fill className="object-cover" sizes="100vw" />
        </div>

        <div className="mob-cards grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="mob-card relative rounded-xl overflow-hidden aspect-[16/10]">
            <div className="absolute inset-0 bg-[#0a1118]"><Image src="/images/rayzor/vci_anti_corrosion.png" alt="VCI Anti-Corrosion" fill className="object-cover opacity-60" sizes="(max-width:640px) 100vw, 50vw" /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-2"><Lucide.ShieldCheck className="w-4 h-4 text-[var(--brand-blue)]" /></div>
              <h4 className="font-heading font-bold text-white text-base sm:text-lg tracking-tight mb-0.5">VCI Anti-Corrosion</h4>
              <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed">Protecting automotive & metal components from rust during transit.</p>
            </div>
          </div>
          <div className="mob-card relative rounded-xl overflow-hidden aspect-[16/10]">
            <div className="absolute inset-0 bg-[#0a1118]"><Image src="/images/rayzor/trusted_partner.png" alt="Trusted Partner" fill className="object-cover opacity-85" sizes="(max-width:640px) 100vw, 50vw" /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-5">
              <span className="text-white/80 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-white/30 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit mb-2">Since 2004</span>
              <h4 className="font-heading font-bold text-white text-base sm:text-lg tracking-tight mb-0.5">A Trusted Partner</h4>
              <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed">20+ years of manufacturing excellence from Madurai.</p>
            </div>
          </div>
          <div className="mob-card relative rounded-xl overflow-hidden aspect-[16/10] sm:col-span-2">
            <div className="absolute inset-0 bg-[#0f172a]"><Image src="/images/rayzor/certifications.png" alt="Certifications" fill className="object-cover opacity-40" sizes="100vw" /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2"><Lucide.Award className="w-4 h-4 text-[#feb234]" /></div>
              <h4 className="font-heading font-bold text-white text-base sm:text-lg tracking-tight mb-0.5">Certified Quality</h4>
              <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed">ISO certified manufacturing processes and rigorous quality assurance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ DESKTOP (≥ 1024px) — pinned scroll ══════════ */}
      <div className="hidden lg:block h-screen pt-24">
        <div className="absolute bottom-10 xl:bottom-16 left-0 w-full h-[68%] z-10">
          <div ref={imageRef} className="relative h-full z-10 overflow-hidden shadow-xl t-resize" style={{ transformOrigin: "left center" }}>
            <Image src="/images/rayzor/about/unique-hero.png" alt="Rayzor Industrial Packaging Pvt Ltd Manufacturing" fill className="object-cover object-center" priority />
          </div>
          <div ref={cardsContainerRef} className="absolute top-0 right-4 xl:right-8 w-[58%] h-full z-0 flex flex-col justify-center px-0" style={{ opacity: 0 }} data-open="false">
            <div ref={bentoRef} className="t-avatar-group grid grid-cols-2 grid-rows-2 gap-4 xl:gap-5 h-full max-h-[680px] my-auto" onMouseLeave={() => setShifts(null, "out")}>
              <div className="t-avatar row-span-2 relative rounded-2xl xl:rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-shadow duration-500" onMouseEnter={() => setShifts(0, "in")}>
                <div className="absolute inset-0 bg-[#0a1118]"><Image src="/images/rayzor/vci_anti_corrosion.png" alt="VCI" fill className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" sizes="30vw" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-end p-6 xl:p-8">
                  <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 xl:mb-5 group-hover:scale-110 transition-transform duration-300"><Lucide.ShieldCheck className="w-5 h-5 xl:w-6 xl:h-6 text-[var(--brand-blue)]" /></div>
                  <h4 className="font-heading font-extrabold text-white text-xl xl:text-2xl 2xl:text-3xl mb-1.5 xl:mb-2 tracking-tight">VCI Anti-Corrosion</h4>
                  <p className="text-white/70 text-sm xl:text-base leading-relaxed max-w-[90%] font-medium">Specialized VCI poly bags and emitters protecting critical automotive & metal components from rust during global transit.</p>
                </div>
              </div>
              <div className="t-avatar relative rounded-2xl xl:rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-shadow duration-500" onMouseEnter={() => setShifts(1, "in")}>
                <div className="absolute inset-0 bg-[#0a1118]"><Image src="/images/rayzor/trusted_partner.png" alt="Trusted Partner" fill className="object-cover opacity-85 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" sizes="30vw" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <div className="relative z-20 h-full flex flex-col justify-between p-5 xl:p-7">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-[var(--brand-blue)] group-hover:border-[var(--brand-blue)] transition-all duration-300 shadow-lg"><Lucide.Handshake className="w-4 h-4 xl:w-5 xl:h-5" /></div>
                    <span className="text-white/90 text-[9px] xl:text-xs font-bold uppercase tracking-widest border border-white/30 bg-black/20 backdrop-blur-sm px-2 xl:px-3 py-1 xl:py-1.5 rounded-full">Since 2004</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-white text-lg xl:text-xl 2xl:text-2xl mb-1 tracking-tight">A Trusted Partner</h4>
                    <p className="text-white/80 text-xs xl:text-sm 2xl:text-base leading-relaxed font-medium">20+ years of in-house manufacturing excellence from Madurai.</p>
                  </div>
                </div>
              </div>
              <div className="t-avatar relative rounded-2xl xl:rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-shadow duration-500" onMouseEnter={() => setShifts(2, "in")}>
                <div className="absolute inset-0 bg-[#0f172a]"><Image src="/images/rayzor/certifications.png" alt="Certifications" fill className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" sizes="30vw" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-between p-5 xl:p-7">
                  <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors duration-300 shadow-lg"><Lucide.Award className="w-4 h-4 xl:w-5 xl:h-5 text-[#feb234]" /></div>
                  <div>
                    <h4 className="font-heading font-extrabold text-white text-lg xl:text-xl 2xl:text-2xl mb-1 tracking-tight">Certified Quality</h4>
                    <p className="text-white/70 text-xs xl:text-sm 2xl:text-base leading-relaxed font-medium">ISO certified manufacturing processes and rigorous quality assurance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Big scrolling text — desktop only */}
        <div className="t-stagger absolute bottom-[75%] translate-y-[50%] left-0 w-max z-20 pointer-events-none">
          <div ref={textRef} className="relative flex items-center">
            <h2 className="t-stagger-line t-stagger-line--1 font-heading font-black uppercase whitespace-nowrap tracking-tighter mix-blend-multiply drop-shadow-[0_4px_10px_rgba(255,255,255,0.3)] flex" style={{ fontSize: "clamp(3rem, 8vw, 8rem)", lineHeight: "0.85" }}>
              {"WHAT MAKES US ".split("").map((char, i) => (
                <span key={i} className="about-char inline-block text-[var(--brand-dark)]" style={{ display: char === " " ? "inline" : "inline-block" }}>{char === " " ? "\u00A0" : char}</span>
              ))}
              {"UNIQUE".split("").map((char, i) => (
                <span key={`u-${i}`} className="about-char inline-block text-[var(--brand-blue)]">{char}</span>
              ))}
            </h2>
          </div>
        </div>
      </div>

    </section>
  );
}
