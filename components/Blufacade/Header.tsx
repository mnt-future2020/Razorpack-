"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useProducts } from "@/hooks/use-products";
import { useServices } from "@/hooks/use-services";
import { useSettings } from "@/hooks/use-settings";
import { useContact } from "@/hooks/use-contact";
import { FALLBACK_PRODUCTS } from "@/lib/fallback-products";
import { FALLBACK_SERVICES } from "@/lib/fallback-services";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "ABOUT US", href: "/about" },
  { label: "PRODUCTS", href: "/products", hasDropdown: true },
  { label: "SERVICES", href: "/services", hasDropdown: true },
  { label: "GALLERY", href: "/gallery" },
];

type NavState = "top" | "hidden" | "scrolled";

/* ─── Mega Menu Carousel ─── */
function MegaCarousel({
  items,
  basePath,
}: {
  items: { name: string; image: string; slug: string; category?: string }[];
  basePath: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Reset scroll position when items change (e.g. category switch)
    el.scrollLeft = 0;
    // Delay check so items are rendered and measured
    const raf = requestAnimationFrame(() => {
      checkScroll();
    });
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll, items]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 z-20 flex items-center justify-center w-7 text-[#666] hover:text-[#222] transition-colors cursor-pointer"
          style={{ height: "220px" }}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
      )}
      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 z-20 flex items-center justify-center w-7 text-[#666] hover:text-[#222] transition-colors cursor-pointer"
          style={{ height: "220px" }}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
        </button>
      )}

      {/* Scrollable row — centered when few items, scrollable when many */}
      <div
        ref={scrollRef}
        className={`flex overflow-x-auto scrollbar-hide scroll-smooth mx-8 ${items.length <= 6 ? "justify-center" : ""}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${basePath}/${item.slug}`}
            className="group flex-shrink-0 flex flex-col items-center text-center w-[170px] xl:w-[190px]"
          >
            {/* Image — no bg, clean white */}
            <div
              className="relative w-full overflow-hidden"
              style={{ height: "220px" }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-3 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                sizes="190px"
              />
            </div>
            {/* Label */}
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#2c2c2c] leading-[1.45] group-hover:text-[var(--brand-blue)] transition-colors px-1">
              {item.name}
            </p>
          </Link>
        ))}
      </div>

      {/* View all */}
      <div className="flex justify-center mt-8 pb-1">
        <Link
          href={basePath}
          className="text-[13px] font-normal text-[#2c2c2c] underline underline-offset-[6px] decoration-[0.5px] decoration-[#666] hover:text-[var(--brand-blue)] hover:decoration-[var(--brand-blue)] transition-colors"
        >
          View all
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Header ─── */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [navState, setNavState] = useState<NavState>("top");
  const pathname = usePathname();
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Fetch dynamic site settings
  const { settings } = useSettings();
  const { contactInfo } = useContact();

  // Fetch data for mega menus
  const { products } = useProducts(1, 20);
  const { services } = useServices(1, 20);

  // Normalize products data (API uses productName, fallback uses name)
  const megaProducts = (products && products.length > 0 ? products : []).map(
    (p: any) => ({
      name: p.productName || p.name,
      image: p.image,
      slug: p.slug,
      category: p.category,
    }),
  );
  const displayProducts =
    megaProducts.length > 0
      ? megaProducts
      : FALLBACK_PRODUCTS.map((p) => ({
          name: p.name,
          image: p.image,
          slug: p.slug,
          category: p.category,
        }));

  const megaServices = (services && services.length > 0 ? services : []).map(
    (s: any) => ({
      name: s.serviceName || s.name,
      image: s.image,
      slug: s.slug,
    }),
  );
  const displayServices =
    megaServices.length > 0
      ? megaServices
      : FALLBACK_SERVICES.map((s) => ({
          name: s.serviceName,
          image: s.image,
          slug: s.slug,
        }));

  // Get unique categories for products
  const productCategories = [
    "ALL",
    ...Array.from(
      new Set(displayProducts.map((p) => p.category).filter(Boolean)),
    ),
  ] as string[];
  const [activeCategory, setActiveCategory] = useState("ALL");
  const filteredProducts =
    activeCategory === "ALL"
      ? displayProducts
      : displayProducts.filter((p) => p.category === activeCategory);

  const mobileSocialLinks = [
    {
      label: "Instagram",
      href: contactInfo?.instagram || siteConfig.social.instagram,
      icon: <Instagram className="w-5 h-5" />,
    },
    {
      label: "LinkedIn",
      href: contactInfo?.linkedin || siteConfig.social.linkedin,
      icon: <Linkedin className="w-5 h-5" />,
    },
    {
      label: "Facebook",
      href: contactInfo?.facebook || siteConfig.social.facebook,
      icon: <Facebook className="w-5 h-5" />,
    },
    {
      label: "Twitter",
      href: contactInfo?.twitter || siteConfig.social.twitter,
      icon: <Twitter className="w-5 h-5" />,
    },
  ].filter((s) => Boolean(s.href));

  useEffect(() => {
    const threshold = 80;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const direction = currentY > lastScrollY.current ? "down" : "up";

        if (currentY <= threshold) {
          setNavState("top");
        } else if (direction === "down" && currentY > threshold) {
          setNavState("hidden");
        } else if (direction === "up") {
          setNavState("scrolled");
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
  }, [menuOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  const handleDropdownEnter = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleMegaEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMegaLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const isHidden = navState === "hidden" && !menuOpen;
  const isTop = navState === "top" && !menuOpen;

  const hasDarkHero =
    pathname === "/" || pathname === "/gallery" || pathname === "/login";
  const useLightText = isTop && hasDarkHero;

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: isHidden ? "translateY(-100%)" : "translateY(0%)" }}
      >
        <div className="flex items-stretch h-14 sm:h-16 lg:h-[72px]">
          {/* ─── LEFT: Logo + Company Name ─── */}
          <div
            className="shrink-0 flex items-center pl-4 pr-4 lg:pl-6 lg:pr-6 xl:pl-8 xl:pr-10 transition-all duration-500"
            style={{ backgroundColor: isTop ? "transparent" : "#ffffff" }}
          >
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 lg:gap-3.5 group"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded flex items-center justify-center shrink-0 transition-all duration-500"
                style={{
                  border: useLightText
                    ? "1.5px solid rgba(255,255,255,0.35)"
                    : "1.5px solid #e0e0e0",
                  backgroundColor: useLightText
                    ? "rgba(0,0,0,0.2)"
                    : "transparent",
                }}
              >
                <Image
                  src={
                    settings?.logo ||
                    "/images/rayzor/logo/Rayzor Final Logo File-03.png"
                  }
                  alt={
                    settings?.siteName
                      ? `${settings.siteName} Logo`
                      : "Rayzor Industrial Packaging Pvt Ltd Logo"
                  }
                  width={36}
                  height={36}
                  className="h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9 object-contain"
                  priority
                />
              </div>
              <span className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-heading font-extrabold tracking-tight leading-none transition-colors duration-500 uppercase">
                {(() => {
                  const name = settings?.siteName || "RAYZORPACK";
                  const accent = settings?.siteNameAccent || "PACK";
                  const upperName = name.toUpperCase();
                  const upperAccent = accent.toUpperCase();
                  const idx = upperName.lastIndexOf(upperAccent);
                  if (idx > 0) {
                    return (
                      <>
                        <span
                          style={{
                            color: useLightText
                              ? "var(--brand-white)"
                              : "var(--brand-dark)",
                          }}
                        >
                          {upperName.slice(0, idx)}
                        </span>
                        <span className="text-[var(--brand-blue)]">
                          {upperName.slice(idx)}
                        </span>
                      </>
                    );
                  }
                  return (
                    <span
                      style={{
                        color: useLightText
                          ? "var(--brand-white)"
                          : "var(--brand-dark)",
                      }}
                    >
                      {upperName}
                    </span>
                  );
                })()}
              </span>
            </Link>
          </div>

          {/* ─── RIGHT: Nav + buttons — always white bg ─── */}
          <div className="hidden lg:flex flex-1 items-stretch bg-white">
            <nav className="flex items-center gap-4 xl:gap-7 h-full flex-1 justify-end pr-4 xl:pr-6">
              {navItems.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div
                      key={item.label}
                      className="relative h-full flex items-center"
                      onMouseEnter={() => handleDropdownEnter(item.label)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-0.5 text-[10px] lg:text-[11px] xl:text-[13px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                          activeDropdown === item.label ||
                          pathname === item.href ||
                          pathname.startsWith(item.href + "/")
                            ? "text-[var(--brand-dark)]"
                            : "text-[var(--brand-dark)] hover:text-[var(--brand-blue)]"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`}
                        />
                      </Link>
                      {/* Active underline indicator — Cartier style */}
                      {activeDropdown === item.label && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-dark)]" />
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-[10px] lg:text-[11px] xl:text-[13px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                      pathname === item.href
                        ? "text-[var(--brand-blue)]"
                        : "text-[var(--brand-dark)] hover:text-[var(--brand-blue)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Download Profile */}
              <a
                href={settings?.companyProfile || "/about"}
                target={settings?.companyProfile ? "_blank" : undefined}
                rel={
                  settings?.companyProfile ? "noopener noreferrer" : undefined
                }
                download={settings?.companyProfile ? true : undefined}
                className="flex items-center gap-1 text-[9px] lg:text-[10px] xl:text-[12px] font-semibold uppercase tracking-wider text-[var(--brand-dark)] border border-[var(--brand-dark)] px-2.5 lg:px-3 xl:px-4 py-1.5 xl:py-2 whitespace-nowrap hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-3 h-3 xl:w-3.5 xl:h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Profile
              </a>
            </nav>

            {/* Contact Us */}
            <Link
              href="/contact"
              className="flex items-center justify-center bg-[var(--brand-blue)] text-white px-4 lg:px-5 xl:px-8 h-full font-bold text-[10px] lg:text-[11px] xl:text-[13px] uppercase tracking-wider whitespace-nowrap hover:bg-[#3aa0cc] transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* ─── MOBILE: right side with hamburger ─── */}
          <div
            className="lg:hidden flex flex-1 items-center justify-end px-3 sm:px-4 transition-colors duration-500"
            style={{ backgroundColor: useLightText ? "transparent" : isTop ? "transparent" : "#ffffff" }}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 sm:p-2 transition-colors duration-500"
              style={{
                color: useLightText ? "var(--brand-white)" : "var(--brand-dark)",
              }}
              aria-label="Menu"
            >
              {menuOpen ? (
                <X className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
            </button>
          </div>
        </div>

        {/* ─── MEGA MENU DROPDOWN ─── */}
        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="hidden lg:block absolute top-full left-0 right-0 bg-white border-t border-[#e5e5e5] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-40"
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
            >
              <div className="max-w-[1400px] mx-auto px-10 xl:px-16">
                {/* ─── PRODUCTS MEGA MENU ─── */}
                {activeDropdown === "PRODUCTS" && (
                  <div className="pt-6 pb-6">
                    {/* Category tabs — Cartier style: indented, generous spacing */}
                    <div className="flex items-center justify-center gap-8 xl:gap-10 mb-6 border-b border-[#e5e5e5] pb-4">
                      {productCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`text-[11px] xl:text-[12px] font-semibold uppercase tracking-[0.12em] pb-1 transition-colors relative whitespace-nowrap cursor-pointer ${
                            activeCategory === cat
                              ? "text-[#1a1a1a]"
                              : "text-[#999] hover:text-[#555]"
                          }`}
                        >
                          {cat === "ALL" ? "ALL PRODUCTS" : cat}
                          {activeCategory === cat && (
                            <span className="absolute bottom-[-17px] left-0 right-0 h-[2.5px] bg-[var(--brand-blue)]" />
                          )}
                        </button>
                      ))}
                    </div>
                    {/* Carousel */}
                    <MegaCarousel
                      items={filteredProducts}
                      basePath="/products"
                    />
                  </div>
                )}

                {/* ─── SERVICES MEGA MENU ─── */}
                {activeDropdown === "SERVICES" && (
                  <div className="pt-6 pb-6">
                    {/* Sub-tabs */}
                    <div className="flex items-center justify-center gap-8 xl:gap-10 mb-6 border-b border-[#e5e5e5] pb-4">
                      <span className="text-[11px] xl:text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1a1a1a] relative pb-1">
                        Our Services
                        <span className="absolute bottom-[-17px] left-0 right-0 h-[2.5px] bg-[var(--brand-blue)]" />
                      </span>
                    </div>
                    {/* Carousel */}
                    <MegaCarousel
                      items={displayServices}
                      basePath="/services"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Backdrop overlay when mega menu is open */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block fixed inset-0 bg-black/20 z-40"
            style={{ top: "72px" }}
            onClick={() => setActiveDropdown(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-40 flex flex-col pt-24 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMenuOpen(false);
            }}
          >
            <motion.nav
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 },
                },
                closed: {
                  transition: { staggerChildren: 0.05, staggerDirection: -1 },
                },
              }}
              className="flex flex-col w-full px-8 py-8 gap-6"
            >
              {navItems.map((item) => (
                <motion.div
                  key={item.label}
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -20 },
                  }}
                  className="border-b border-black/5 pb-4"
                >
                  <Link
                    href={item.href}
                    className="text-2xl font-bold text-[var(--brand-dark)] hover:text-[var(--brand-blue)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={{
                  open: { opacity: 1, x: 0 },
                  closed: { opacity: 0, x: -20 },
                }}
                className="pt-4"
              >
                <Link
                  href="/contact"
                  className="flex items-center justify-center w-full bg-[var(--brand-blue)] text-white py-4 rounded-md font-bold text-lg hover:bg-[#3aa0cc] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  GET QUOTE
                </Link>
              </motion.div>
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 20 },
                }}
                className="mt-12 flex justify-center gap-6"
              >
                {mobileSocialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-[var(--brand-dark)] hover:text-white hover:bg-[var(--brand-blue)] hover:border-[var(--brand-blue)] transition-all"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
