"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Clock, Send, Loader2, Facebook, Instagram, Linkedin, Twitter, Youtube, MessageCircle } from "lucide-react"
import { useContact } from "@/hooks/use-contact"
import { useServices } from "@/hooks/use-services"

export function ContactContent() {
  const { contactInfo, isLoading: isContactLoading } = useContact()
  const { services } = useServices()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" })
  
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    division: "",
    source: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus({ type: 'success', message: "Thank you! Your message has been sent successfully." })
        setFormData({ fullName: "", companyName: "", email: "", phone: "", division: "", source: "", message: "" })
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

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Full Name"
                    className="w-full bg-white border-0 p-5 text-[15px] outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#36312d]"
                  />
                </div>

                {/* Company Name */}
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Company Name"
                    className="w-full bg-white border-0 p-5 text-[15px] outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#36312d]"
                  />
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email Address"
                    className="w-full bg-white border-0 p-5 text-[15px] outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#36312d]"
                  />
                </div>

                {/* Contact Number */}
                <div className="sm:col-span-1">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contact Number"
                    className="w-full bg-white border-0 p-5 text-[15px] outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#36312d]"
                  />
                </div>

                {/* Division Interested In */}
                <div className="sm:col-span-1 relative">
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full bg-white border-0 p-5 text-[15px] outline-none focus:ring-2 focus:ring-[#1a1a1a] appearance-none cursor-pointer"
                    style={{ color: formData.division ? "#36312d" : "#9ca3af" }}
                  >
                    <option value="" disabled hidden>Division Interested In</option>
                    <option value="VCI Protection" className="text-[#36312d]">VCI Protection</option>
                    <option value="Export Palletization" className="text-[#36312d]">Export Palletization</option>
                    <option value="Contract Packaging" className="text-[#36312d]">Contract Packaging</option>
                    <option value="Specialty Films" className="text-[#36312d]">Specialty Films</option>
                  </select>
                  {/* Dropdown Arrow */}
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Radio Group */}
                <div className="sm:col-span-2 mt-4 mb-3">
                  <label className="block text-[15px] font-medium text-white mb-5">
                    Where did you hear about Rayzor Industrial Packaging Pvt Ltd? *
                  </label>
                  <div className="flex flex-wrap gap-x-10 gap-y-4">
                    {["LinkedIn", "Word of mouth", "Online search", "Other"].map((source) => (
                      <label key={source} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center transition-colors ${formData.source === source ? 'bg-white' : 'bg-transparent group-hover:bg-white/20'}`}>
                          {formData.source === source && <div className="w-2 h-2 rounded-full bg-[var(--brand-blue)] ring-2 ring-white" />}
                        </div>
                        <input
                          type="radio"
                          name="source"
                          value={source}
                          checked={formData.source === source}
                          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                          className="sr-only"
                          required
                        />
                        <span className="text-[15px] text-white/90">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="sm:col-span-2">
                  <textarea
                    required
                    rows={7}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Message..."
                    className="w-full bg-white border-0 p-5 text-[15px] outline-none focus:ring-2 focus:ring-[#1a1a1a] resize-none text-[#36312d]"
                  />
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
