"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface PageBannerProps {
  title: string
  breadcrumb?: { label: string; href: string }[]
  backgroundImage?: string
}

export function PageBanner({ title, breadcrumb, backgroundImage }: PageBannerProps) {
  return (
    <section 
      className={`relative min-h-[400px] flex flex-col justify-center overflow-hidden ${
        backgroundImage ? "bg-black" : "bg-gradient-to-br from-[#014a74] to-[#012d47]"
      }`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
    >
      {/* Background Pattern - Only show when NO background image is present */}
      {!backgroundImage && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10 py-20">
        {/* Breadcrumb */}
        {breadcrumb && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-white/80 text-lg mb-6 font-medium"
          >
            {breadcrumb.map((item, index) => (
              <div key={item.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-5 h-5" />}
                {index === breadcrumb.length - 1 ? (
                  <span className="text-[#f58420]">{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl"
        >
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-md"
            dangerouslySetInnerHTML={{ 
              __html: title.replace(/(Rayzor Industrial Packaging Pvt Ltd|Services|Portfolio|Contact)/g, '<span class="text-[#f58420]">$1</span>') 
            }} 
          />
        </motion.div>
      </div>
    </section>
  )
}
