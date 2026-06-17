"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X, ChevronDown, Instagram, Linkedin, Facebook, Twitter } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/config/site"

const navItems = [
  { label: "HOME", href: "/" },
  { label: "ABOUT US", href: "/about" },
  { label: "PRODUCTS", href: "/products", hasDropdown: true },
  { label: "SERVICES", href: "/services" },
  { label: "GALLERY", href: "/portfolio" },
]

type NavState = "top" | "hidden" | "scrolled"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [navState, setNavState] = useState<NavState>("top")
  const pathname = usePathname()
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const mobileSocialLinks = [
    { label: "Instagram", href: siteConfig.social.instagram, icon: <Instagram className="w-5 h-5" /> },
    { label: "LinkedIn", href: siteConfig.social.linkedin, icon: <Linkedin className="w-5 h-5" /> },
    { label: "Facebook", href: siteConfig.social.facebook, icon: <Facebook className="w-5 h-5" /> },
    { label: "Twitter", href: siteConfig.social.twitter, icon: <Twitter className="w-5 h-5" /> },
  ].filter((s) => Boolean(s.href))

  useEffect(() => {
    const threshold = 80

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const direction = currentY > lastScrollY.current ? "down" : "up"

        if (currentY <= threshold) {
          setNavState("top")
        } else if (direction === "down" && currentY > threshold) {
          setNavState("hidden")
        } else if (direction === "up") {
          setNavState("scrolled")
        }

        lastScrollY.current = currentY
        ticking.current = false
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset"
  }, [menuOpen])

  const isHidden = navState === "hidden" && !menuOpen
  // On mobile when menu is open, always show white bg
  const isTop = navState === "top" && !menuOpen

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: isHidden ? "translateY(-100%)" : "translateY(0%)" }}
      >
        <div className="flex items-stretch h-14 sm:h-16 lg:h-[72px]">

          {/* ─── LEFT: Logo + Company Name ───
              Mobile (<lg): white bg always (full bar is white)
              Desktop at top: transparent, hero shows through
              Desktop scrolled: white */}
          <div
            className="shrink-0 flex items-center pl-4 pr-4 lg:pl-6 lg:pr-6 xl:pl-8 xl:pr-10 transition-all duration-500"
            style={{ backgroundColor: isTop ? "transparent" : "#ffffff" }}
          >
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 lg:gap-3.5 group">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded flex items-center justify-center shrink-0 transition-all duration-500"
                style={{
                  border: isTop ? "1.5px solid rgba(255,255,255,0.35)" : "1.5px solid #e0e0e0",
                  backgroundColor: isTop ? "rgba(0,0,0,0.2)" : "transparent",
                }}
              >
                <Image
                  src="/images/rayzor/logo/Rayzor Final Logo File-03.png"
                  alt="Rayzorpack Logo"
                  width={36}
                  height={36}
                  className="h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9 object-contain"
                  priority
                />
              </div>
              <span
                className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-heading font-extrabold tracking-tight leading-none transition-colors duration-500"
              >
                <span style={{ color: isTop ? "#ffffff" : "#2D2D2D" }}>RAYZOR</span>
                <span className="text-[#44B8E8]">PACK</span>
              </span>
            </Link>
          </div>

          {/* ─── RIGHT: Nav + buttons — always white bg ─── */}
          <div className="hidden lg:flex flex-1 items-stretch bg-white">
            {/* Nav links — pushed to the right */}
            <nav className="flex items-center gap-4 xl:gap-7 h-full flex-1 justify-end pr-4 xl:pr-6">
              {navItems.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <span
                      key={item.label}
                      className="flex items-center gap-0.5 text-[10px] lg:text-[11px] xl:text-[13px] font-semibold uppercase tracking-wider cursor-default text-[#2D2D2D] whitespace-nowrap hover:text-[#44B8E8] transition-colors"
                    >
                      {item.label}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  )
                }
                return (
                  <span
                    key={item.label}
                    className={`text-[10px] lg:text-[11px] xl:text-[13px] font-semibold uppercase tracking-wider cursor-default whitespace-nowrap transition-colors ${
                      pathname === item.href
                        ? "text-[#44B8E8]"
                        : "text-[#2D2D2D] hover:text-[#44B8E8]"
                    }`}
                  >
                    {item.label}
                  </span>
                )
              })}

              {/* Download Profile — bordered button */}
              <span className="flex items-center gap-1 text-[9px] lg:text-[10px] xl:text-[12px] font-semibold uppercase tracking-wider text-[#2D2D2D] border border-[#2D2D2D] px-2.5 lg:px-3 xl:px-4 py-1.5 xl:py-2 cursor-default whitespace-nowrap hover:bg-gray-50 transition-colors">
                <svg className="w-3 h-3 xl:w-3.5 xl:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Profile
              </span>
            </nav>

            {/* Contact Us — blue filled button, flush right */}
            <span className="flex items-center justify-center bg-[#44B8E8] text-white px-4 lg:px-5 xl:px-8 h-full font-bold text-[10px] lg:text-[11px] xl:text-[13px] uppercase tracking-wider cursor-default whitespace-nowrap hover:bg-[#3aa0cc] transition-colors">
              Contact Us
            </span>
          </div>

          {/* ─── MOBILE: right side with hamburger ─── */}
          <div
            className="lg:hidden flex flex-1 items-center justify-end px-3 sm:px-4 transition-colors duration-500"
            style={{ backgroundColor: isTop ? "transparent" : "#ffffff" }}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 sm:p-2 transition-colors duration-500"
              style={{ color: isTop ? "#ffffff" : "#2D2D2D" }}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Menu className="w-6 h-6 sm:w-7 sm:h-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-40 flex flex-col pt-24 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false) }}
          >
            <motion.nav
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              }}
              className="flex flex-col w-full px-8 py-8 gap-6"
            >
              {navItems.map((item) => (
                <motion.div
                  key={item.label}
                  variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }}
                  className="border-b border-black/5 pb-4"
                >
                  <Link
                    href={item.href}
                    className="text-2xl font-bold text-[#2D2D2D] hover:text-[#44B8E8] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -20 } }}
                className="pt-4"
              >
                <Link
                  href="/contact"
                  className="flex items-center justify-center w-full bg-[#44B8E8] text-white py-4 rounded-md font-bold text-lg hover:bg-[#3aa0cc] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  GET QUOTE
                </Link>
              </motion.div>
              <motion.div
                variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 20 } }}
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
                    className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#2D2D2D] hover:text-white hover:bg-[#44B8E8] hover:border-[#44B8E8] transition-all"
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
  )
}
