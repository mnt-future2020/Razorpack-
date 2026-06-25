"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Clock, Send, Loader2, Facebook, Instagram, Linkedin, Twitter, Youtube, MessageCircle } from "lucide-react"
import { useContact } from "@/hooks/use-contact"
import { useServices } from "@/hooks/use-services"
import { useProducts } from "@/hooks/use-products"

export function ContactContent() {
  const { contactInfo } = useContact()
  const { services } = useServices(1, 100)
  const [productPage, setProductPage] = useState(1)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [hasMoreProducts, setHasMoreProducts] = useState(true)
  const { products, pagination: productPagination } = useProducts(productPage, 10)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Accumulate products as pages load
  useEffect(() => {
    if (products && products.length > 0) {
      setAllProducts(prev => {
        const existingIds = new Set(prev.map((p: any) => p._id || p.slug))
        const newItems = products.filter((p: any) => !existingIds.has(p._id || p.slug))
        return [...prev, ...newItems]
      })
      setHasMoreProducts(productPagination?.hasNextPage || false)
    }
  }, [products, productPagination])

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || !dropdownOpen) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreProducts) {
          setProductPage(prev => prev + 1)
        }
      },
      { root: dropdownRef.current, threshold: 0.1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [dropdownOpen, hasMoreProducts])

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-subject-dropdown]")) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" })
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[+]?[\d\s()-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid phone number"
    }

    if (!formData.subject) newErrors.subject = "Please select a service or product"
    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject || "General Enquiry",
          message: formData.message,
          source: "website",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus({ type: 'success', message: "Thank you! Your enquiry has been submitted. We'll contact you within 24 hours." })
        setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" })
      } else {
        setSubmitStatus({ type: 'error', message: data.error || "Something went wrong. Please try again." })
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: "Failed to send message. Please try again later." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper to get array of branches if stored as comma-separated string
  const serviceAreas = contactInfo?.serviceAreas 
    ? contactInfo.serviceAreas.split(',').map(area => area.trim()) 
    : ["Chennai", "Madurai", "Dindigul", "Tamil Nadu", "South India"]

  return (
    <>
      {/* ─── NEW PREMIUM FORM SECTION ─── */}
      <section 
        className="relative py-24 md:py-32 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/rayzor/contact_bg.png')" }}
      >
        <div className="max-w-[92vw] mx-auto px-[2vw]">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Side: Headings */}
            <div className="lg:col-span-5 pt-4">
              <h1 className="text-[clamp(4rem,7vw,7rem)] font-medium text-white leading-[0.9] tracking-tight mb-8">
                Contact Us
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-medium max-w-md leading-relaxed">
                We're here to serve you, Please get in touch...
              </p>
            </div>

            {/* Right Side: Form Grid */}
            <div className="lg:col-span-7">
              {submitStatus.message && (
                <div className={`p-4 mb-6 rounded-none ${submitStatus.type === 'success' ? 'bg-white text-green-700' : 'bg-white text-red-700'}`}>
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>

                {/* First Name */}
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" })) }}
                    placeholder="First Name *"
                    className={`w-full bg-white border-2 p-5 text-[15px] outline-none focus:ring-0 text-[#36312d] transition-colors ${errors.firstName ? "border-red-400" : "border-transparent focus:border-[#1a1a1a]"}`}
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1 pl-1">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" })) }}
                    placeholder="Last Name *"
                    className={`w-full bg-white border-2 p-5 text-[15px] outline-none focus:ring-0 text-[#36312d] transition-colors ${errors.lastName ? "border-red-400" : "border-transparent focus:border-[#1a1a1a]"}`}
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1 pl-1">{errors.lastName}</p>}
                </div>

                {/* Email Address */}
                <div className="sm:col-span-1">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors(prev => ({ ...prev, email: "" })) }}
                    placeholder="Email Address *"
                    className={`w-full bg-white border-2 p-5 text-[15px] outline-none focus:ring-0 text-[#36312d] transition-colors ${errors.email ? "border-red-400" : "border-transparent focus:border-[#1a1a1a]"}`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1 pl-1">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-1">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if (errors.phone) setErrors(prev => ({ ...prev, phone: "" })) }}
                    placeholder="Phone Number *"
                    className={`w-full bg-white border-2 p-5 text-[15px] outline-none focus:ring-0 text-[#36312d] transition-colors ${errors.phone ? "border-red-400" : "border-transparent focus:border-[#1a1a1a]"}`}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1 pl-1">{errors.phone}</p>}
                </div>

                {/* Service / Product Interested In — Custom scrollable dropdown */}
                <div className="sm:col-span-2 relative" data-subject-dropdown>
                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(!dropdownOpen); if (errors.subject) setErrors(prev => ({ ...prev, subject: "" })) }}
                    className={`w-full bg-white border-2 p-5 text-[15px] outline-none focus:ring-0 cursor-pointer text-left flex items-center justify-between transition-colors ${errors.subject ? "border-red-400" : "border-transparent focus:border-[#1a1a1a]"}`}
                  >
                    <span style={{ color: formData.subject ? "#36312d" : "#9ca3af" }}>
                      {formData.subject || "Service / Product Interested In *"}
                    </span>
                    <svg className={`w-5 h-5 text-gray-800 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 z-50 bg-white shadow-xl border border-gray-200 max-h-[280px] overflow-y-auto"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {/* Services */}
                      {services && services.length > 0 && (
                        <>
                          <div className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-blue)] bg-gray-50 sticky top-0">Services</div>
                          {services.map((s: any) => (
                            <button
                              key={s._id || s.slug}
                              type="button"
                              onClick={() => { setFormData({ ...formData, subject: s.serviceName }); setDropdownOpen(false) }}
                              className={`w-full text-left px-5 py-3 text-[14px] hover:bg-[var(--brand-blue)]/5 transition-colors ${formData.subject === s.serviceName ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] font-medium" : "text-[#36312d]"}`}
                            >
                              {s.serviceName}
                            </button>
                          ))}
                        </>
                      )}

                      {/* Products — infinite scroll */}
                      {allProducts.length > 0 && (
                        <>
                          <div className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-blue)] bg-gray-50 sticky top-0">Products</div>
                          {allProducts.map((p: any) => (
                            <button
                              key={p._id || p.slug}
                              type="button"
                              onClick={() => { setFormData({ ...formData, subject: p.productName }); setDropdownOpen(false) }}
                              className={`w-full text-left px-5 py-3 text-[14px] hover:bg-[var(--brand-blue)]/5 transition-colors ${formData.subject === p.productName ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] font-medium" : "text-[#36312d]"}`}
                            >
                              {p.productName}
                            </button>
                          ))}
                          {/* Infinite scroll loader */}
                          {hasMoreProducts && (
                            <div ref={loaderRef} className="px-5 py-3 text-center">
                              <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-blue)] mx-auto" />
                            </div>
                          )}
                        </>
                      )}

                      {/* Other */}
                      <div className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 sticky top-0">Other</div>
                      {["Custom Solution", "General Enquiry"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => { setFormData({ ...formData, subject: item }); setDropdownOpen(false) }}
                          className={`w-full text-left px-5 py-3 text-[14px] hover:bg-[var(--brand-blue)]/5 transition-colors ${formData.subject === item ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] font-medium" : "text-[#36312d]"}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  {errors.subject && <p className="text-red-400 text-xs mt-1 pl-1">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div className="sm:col-span-2">
                  <textarea
                    rows={7}
                    value={formData.message}
                    onChange={(e) => { setFormData({ ...formData, message: e.target.value }); if (errors.message) setErrors(prev => ({ ...prev, message: "" })) }}
                    placeholder="Tell us about your packaging requirements... *"
                    className={`w-full bg-white border-2 p-5 text-[15px] outline-none focus:ring-0 resize-none text-[#36312d] transition-colors ${errors.message ? "border-red-400" : "border-transparent focus:border-[#1a1a1a]"}`}
                  />
                  {errors.message && <p className="text-red-400 text-xs mt-1 pl-1">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1a1a1a] hover:bg-black text-white px-12 py-4 text-[15px] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ─── EXISTING CONTACT INFO & MAP (MOVED BELOW FORM) ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-[92vw] mx-auto px-[2vw]">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Contact Details Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-[clamp(2rem,3vw,3rem)] font-medium text-[#1a1a1a] mb-6 leading-tight">
                  Reach Out<br/>To Us
                </h2>
                <p className="text-[#8c827a] mb-8 text-[15px] leading-relaxed">
                  Have questions about our packaging solutions? Our team is ready to provide expert guidance and custom quotes.
                </p>
              </div>

              <div className="space-y-6">
                {/* Phone */}
                <a href={`tel:${contactInfo?.primaryPhone || "+919087787879"}`} className="flex items-center gap-6 p-6 md:p-8 rounded-2xl bg-stone-50 border border-stone-200 hover:shadow-xl hover:bg-white transition-all duration-300 group">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--brand-blue)] group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors duration-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] text-lg mb-1">Phone</h3>
                    <p className="text-[#8c827a] font-medium">
                      {contactInfo?.primaryPhone || "+91 90877 87879"}
                      {contactInfo?.secondaryPhone && <><br/>{contactInfo.secondaryPhone}</>}
                      {contactInfo?.whatsappNumber && contactInfo.whatsappNumber !== contactInfo.primaryPhone && <><br/>{contactInfo.whatsappNumber}</>}
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a href={`mailto:${contactInfo?.email || "sales@rayzorpack.com"}`} className="flex items-center gap-6 p-6 md:p-8 rounded-2xl bg-stone-50 border border-stone-200 hover:shadow-xl hover:bg-white transition-all duration-300 group">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--brand-blue)] group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] text-lg mb-1">Email</h3>
                    <p className="text-[#8c827a] font-medium break-all">{contactInfo?.email || "sales@rayzorpack.com"}</p>
                  </div>
                </a>

                {/* Address */}
                <div className="flex items-start gap-6 p-6 md:p-8 rounded-2xl bg-stone-50 border border-stone-200 hover:shadow-xl hover:bg-white transition-all duration-300 group">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--brand-blue)] group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors duration-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] text-lg mb-2">Office</h3>
                    <p className="text-[#8c827a] text-[15px] font-medium leading-relaxed">
                      {contactInfo?.address || "No: 298 A1, M.M Nagar, Thiruppalai"}
                      {contactInfo?.city && <><br />{contactInfo.city}</>}
                      {contactInfo?.state && <> - {contactInfo.postcode || ""}</>}
                      {contactInfo?.state && <><br />{contactInfo.state}, {contactInfo.country || "India"}</>}
                      {!contactInfo?.city && !contactInfo?.state && <><br />Madurai - 625014<br />Tamil Nadu, India</>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Area */}
            <div className="lg:col-span-2">
              {contactInfo?.mapEmbedCode ? (
                <div 
                  className="w-full h-full min-h-[400px] lg:min-h-[600px] bg-stone-100 rounded-3xl overflow-hidden shadow-xl border border-stone-200/60 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: contactInfo.mapEmbedCode }}
                />
              ) : (
                <div className="w-full h-full min-h-[400px] bg-stone-100 rounded-3xl border border-stone-200/60 flex items-center justify-center">
                  <p className="text-gray-400 font-medium">Map not available</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
