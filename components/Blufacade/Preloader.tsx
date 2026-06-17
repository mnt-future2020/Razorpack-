"use client";

import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = "hidden";
    // Scroll to top to ensure we start at the hero
    window.scrollTo(0, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        // Slide out animation
        gsap.to(preloaderRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
          onComplete: () => {
            document.body.style.overflow = "auto";
            // Dispatch event if other components (like Hero) want to wait for preloader
            window.dispatchEvent(new Event("preloader-complete"));
          }
        });
      }
    });

    // Simulate loading
    const proxy = { val: 0 };
    tl.to(proxy, {
      val: 100,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => {
        setProgress(Math.floor(proxy.val));
      }
    });

    // Animate the progress bar width
    tl.to(barRef.current, {
      width: "100%",
      duration: 2.5,
      ease: "power2.out"
    }, 0);

    // Subtle scale animation on the massive text
    tl.fromTo(textRef.current, 
      { scale: 0.95, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 1.5, ease: "power3.out" }, 
      0
    );

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div 
      ref={preloaderRef}
      className="fixed inset-0 z-[99999] bg-[#0a1118] text-white flex flex-col justify-between p-6 md:p-8 lg:p-12 overflow-hidden"
    >
      {/* Top Info Bar */}
      <div className="flex justify-between items-start text-xs md:text-sm font-medium text-[#a1a1aa] z-10">
        <div className="leading-snug">
          Premium Packaging<br/>
          Industrial Solutions
        </div>
        <div className="leading-snug text-center hidden md:block">
          Madurai<br/>
          Tamil Nadu
        </div>
        <div className="leading-snug text-right">
          Loading<br/>
          <span className="text-white text-base md:text-lg tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Center Massive Logo Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6">
         <h1 
           ref={textRef}
           className="text-[15vw] lg:text-[16vw] font-black tracking-tighter leading-none w-full text-center" 
           style={{ transform: "scaleY(1.2)" }}
         >
           <span className="text-white">RAYZOR</span>
           <span className="text-[#1689cf]">PACK</span>
         </h1>
      </div>

      {/* Bottom Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1b1c19]">
        <div ref={barRef} className="h-full bg-[#1689cf] w-0" />
      </div>
    </div>
  );
}
