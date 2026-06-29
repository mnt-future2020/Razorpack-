"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  type MotionValue,
} from "motion/react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

interface CaseStudy {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
  squares: { x: number; y: number; size: number }[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "vci-films",
    title: "VCI Films",
    category: "Anti-Corrosion Protection",
    year: "2024",
    image: "/images/rayzor/services/vci-poly-bags.jpg",
    squares: [
      { x: 5, y: 30, size: 16 },
      { x: 10, y: 42, size: 10 },
      { x: 3, y: 52, size: 7 },
      { x: 80, y: 70, size: 14 },
      { x: 85, y: 82, size: 9 },
      { x: 78, y: 60, size: 6 },
    ],
  },
  {
    id: "ldpe-solutions",
    title: "LDPE Solutions",
    category: "Industrial Packaging",
    year: "2024",
    image: "/images/rayzor/services/ldpe-film-rolls.jpg",
    squares: [
      { x: 82, y: 55, size: 16 },
      { x: 88, y: 68, size: 10 },
      { x: 78, y: 72, size: 7 },
      { x: 85, y: 42, size: 6 },
      { x: 90, y: 80, size: 8 },
    ],
  },
  {
    id: "export-packaging",
    title: "Export Packaging",
    category: "Container & Pallet Solutions",
    year: "2023",
    image: "/images/rayzor/services/stretch-films.jpg",
    squares: [
      { x: 4, y: 24, size: 16 },
      { x: 10, y: 36, size: 10 },
      { x: 2, y: 44, size: 7 },
      { x: 78, y: 78, size: 14 },
      { x: 84, y: 88, size: 8 },
    ],
  },
  {
    id: "specialty-films",
    title: "Specialty Films",
    category: "Shrink & Antistatic Films",
    year: "2023",
    image: "/images/rayzor/services/bubble-wrap.jpg",
    squares: [
      { x: 82, y: 26, size: 14 },
      { x: 88, y: 38, size: 10 },
      { x: 78, y: 44, size: 7 },
      { x: 84, y: 54, size: 5 },
      { x: 90, y: 60, size: 8 },
    ],
  },
];

const HEADER_SQUARES = [
  { x: 6, y: 20, size: 12 },
  { x: 12, y: 32, size: 8 },
  { x: 8, y: 44, size: 6 },
  { x: 88, y: 18, size: 10 },
  { x: 92, y: 30, size: 14 },
  { x: 85, y: 42, size: 7 },
  { x: 90, y: 52, size: 5 },
  { x: 14, y: 56, size: 5 },
];

const MARQUEE_CLIENTS = [
  "Foxconn",
  "Royal Enfield",
  "Asian Paints",
  "Mobis",
  "Kajaria",
  "Dixon",
  "Amara Raja",
  "Rayzorpack",
];

const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/*  PIXEL OVERLAY — uses real inline styles for staggered hover        */
/* ------------------------------------------------------------------ */

const GRID_COLS = 12;
const GRID_ROWS = 8;

function PixelOverlayCard() {
  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      cells.push({ row: r, col: c });
    }
  }

  return (
    <>
      <style>{`
        .pixel-cell {
          position: absolute;
          background: rgba(0,0,0,0.8);
          opacity: 0;
          transform: scale(0);
          transition-property: opacity, transform;
          transition-duration: 0.25s;
          transition-timing-function: ease;
        }
        .group:hover .pixel-cell {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 5 }}>
        {cells.map(({ row, col }) => {
          const delayIn = (row + col) * 0.018;
          const delayOut = (GRID_ROWS - row + (GRID_COLS - col)) * 0.012;
          return (
            <div
              key={`${row}-${col}`}
              className="pixel-cell"
              style={
                {
                  left: `${(col / GRID_COLS) * 100}%`,
                  top: `${(row / GRID_ROWS) * 100}%`,
                  width: `${100 / GRID_COLS}%`,
                  height: `${100 / GRID_ROWS}%`,
                  transitionDelay: `${delayOut}s`,
                  "--delay-in": `${delayIn}s`,
                  "--delay-out": `${delayOut}s`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
      <style>{`
        .group:hover .pixel-cell {
          transition-delay: var(--delay-in) !important;
        }
      `}</style>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  MAGNETIC SQUARE                                                    */
/* ------------------------------------------------------------------ */

function MagneticSquare({
  x,
  y,
  size,
  pointerX,
  pointerY,
}: {
  x: number;
  y: number;
  size: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}) {
  const centerX = x / 100;
  const centerY = y / 100;

  const tx = useTransform(pointerX, (px) => (px - centerX) * 40);
  const ty = useTransform(pointerY, (py) => (py - centerY) * 40);
  const sx = useSpring(tx, { stiffness: 80, damping: 18, mass: 0.6 });
  const sy = useSpring(ty, { stiffness: 80, damping: 18, mass: 0.6 });

  return (
    <motion.div
      className="pointer-events-none absolute bg-black"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        x: sx,
        y: sy,
        zIndex: 6,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  CASE STUDY CARD                                                    */
/* ------------------------------------------------------------------ */

function CaseStudyCard({
  study,
  index,
}: {
  study: CaseStudy;
  index: number;
}) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((e.clientX - rect.left) / rect.width);
    pointerY.set((e.clientY - rect.top) / rect.height);
  };

  const handlePointerLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: EASING }}
    >
      <div
        ref={cardRef}
        className="group relative overflow-hidden"
        style={{ aspectRatio: "4/3" }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Background image */}
        <Image
          src={study.image}
          alt={study.title}
          fill
          className="h-full w-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Pixel-block hover overlay */}
        <PixelOverlayCard />

        {/* Magnetic squares */}
        {study.squares.map((sq, i) => (
          <MagneticSquare
            key={i}
            x={sq.x}
            y={sq.y}
            size={sq.size}
            pointerX={pointerX}
            pointerY={pointerY}
          />
        ))}

        {/* Plus button — top right */}
        <div
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center border border-white/30 text-xs text-white"
          style={{ zIndex: 10 }}
        >
          +
        </div>

        {/* Info plate — bottom left */}
        <div
          className="absolute bottom-0 left-0 bg-white px-4 pb-3 pt-2.5"
          style={{ zIndex: 20, maxWidth: "70%" }}
        >
          <h3 className="text-[clamp(1.4rem,2.2vw,2rem)] font-normal leading-tight text-black">
            {study.title}
          </h3>
          <div className="mt-1.5 flex gap-4">
            <span className="text-[12px] text-black/60">{study.category}</span>
            <span className="text-[12px] font-medium text-black">{study.year}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PARALLAX FLOATING SQUARE (header)                                  */
/* ------------------------------------------------------------------ */

function FloatingSquare({
  x,
  y,
  size,
  index,
  sectionRef,
}: {
  x: number;
  y: number;
  size: number;
  index: number;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [0, -(80 + index * 30)]);
  const smoothY = useSpring(rawY, { stiffness: 40, damping: 20 });

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        y: smoothY,
      }}
    >
      <motion.div
        className="bg-black"
        style={{ width: size, height: size }}
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3 + index * 0.4,
          ease: "easeInOut",
          repeat: Infinity,
          delay: index * 0.3,
        }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  MARQUEE DOT ICON                                                   */
/* ------------------------------------------------------------------ */

function DotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <rect width="8" height="8" fill="black" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function CaseStudiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-60px" });

  const doubled = [...MARQUEE_CLIENTS, ...MARQUEE_CLIENTS];

  return (
    <section
      ref={sectionRef}
      className="relative bg-white text-black"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Marquee keyframe styles */}
      <style>{`
        @keyframes marqueeProjects {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-projects {
          animation: marqueeProjects 28s linear infinite;
        }
        .marquee-projects:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ─── TOP AREA: Header with floating squares ─── */}
      <div className="relative px-6 pb-10 pt-32 sm:px-10 lg:px-16 lg:pt-40">
        {/* Parallax floating squares */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {HEADER_SQUARES.map((sq, i) => (
            <FloatingSquare
              key={i}
              x={sq.x}
              y={sq.y}
              size={sq.size}
              index={i}
              sectionRef={sectionRef}
            />
          ))}
        </div>

        {/* Header text */}
        <motion.div
          ref={headerRef}
          className="relative mx-auto max-w-7xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, ease: EASING }}
        >
          <span className="mb-5 inline-block bg-black px-4 py-1.5 text-[13px] font-medium tracking-wide text-white">
            Projects
          </span>
          <h2 className="text-[clamp(1.8rem,3.2vw,2.8rem)] font-light leading-[1.25] tracking-tight">
            <span className="text-black">Insights from </span>
            <span className="text-black/40">Our</span>
            <br />
            <span className="text-black/40">Case Studies</span>
          </h2>
        </motion.div>
      </div>

      {/* ─── CASE STUDY CARDS (2x2 grid) ─── */}
      <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-10 lg:px-16">
        <div className="grid gap-4 md:grid-cols-2">
          {CASE_STUDIES.map((study, index) => (
            <CaseStudyCard key={study.id} study={study} index={index} />
          ))}
        </div>
      </div>

      {/* ─── FOOTER AREA ─── */}
      <div className="mx-auto max-w-7xl px-6 pb-6 sm:px-10 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          {/* Left side */}
          <div className="max-w-md">
            <div className="mb-4 flex h-7 w-7 items-center justify-center border border-black/20 text-xs text-black">
              +
            </div>
            <p className="text-[14px] leading-[1.7] text-black/60">
              We partner with ambitious industrial brands that are ready to move
              beyond basic packaging — turning their protection, palletization,
              and logistics into one precision-engineered system for growth.
            </p>
            <div className="mt-6">
              <button className="group/cta flex items-end cursor-pointer">
                <span className="inline-flex items-center gap-[10px] border border-black/20 bg-black px-3 py-2 text-base font-medium text-white transition-colors hover:bg-black/85">
                  Get an Enquiry
                </span>
                <span className="mb-6 flex h-6 w-6 items-center justify-center bg-black transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:mb-9">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.75 6V15.75C18.75 15.949 18.671 16.14 18.53 16.28C18.39 16.421 18.199 16.5 18 16.5C17.801 16.5 17.61 16.421 17.47 16.28C17.329 16.14 17.25 15.949 17.25 15.75V7.81L6.53 18.53C6.39 18.671 6.199 18.75 6 18.75C5.801 18.75 5.61 18.671 5.47 18.53C5.329 18.39 5.25 18.199 5.25 18C5.25 17.801 5.329 17.61 5.47 17.47L16.19 6.75H8.25C8.051 6.75 7.86 6.671 7.72 6.53C7.579 6.39 7.5 6.199 7.5 6C7.5 5.801 7.579 5.61 7.72 5.47C7.86 5.329 8.051 5.25 8.25 5.25H18C18.199 5.25 18.39 5.329 18.53 5.47C18.671 5.61 18.75 5.801 18.75 6Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Right side — marquee */}
          <div className="flex-1 overflow-hidden border-t border-black/10 md:ml-12 md:border-t-0">
            <div className="overflow-hidden py-5">
              <div className="marquee-projects flex w-max">
                {doubled.map((name, i) => (
                  <div
                    key={`${name}-${i}`}
                    className="flex shrink-0 items-center gap-2.5 px-8"
                  >
                    <DotIcon />
                    <span className="whitespace-nowrap text-sm font-medium tracking-wide text-black/80">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-12" />
    </section>
  );
}
