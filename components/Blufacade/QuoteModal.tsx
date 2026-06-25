"use client";

import React, { useState } from "react";
import { X, Loader2, Check } from "lucide-react";

interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
  productOrService?: string;
}

export function QuoteModal({ open, onClose, productOrService }: QuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    division: productOrService || "",
    source: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Split fullName into firstName + lastName for API
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "-";

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          subject: formData.division || productOrService || "Quote Request",
          message: formData.message,
          source: "Quote Modal",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ fullName: "", companyName: "", email: "", phone: "", division: productOrService || "", source: "", message: "" });
          onClose();
        }, 2500);
      }
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-[var(--brand-dark)] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-heading font-bold text-lg">Request a Quote</h2>
            {productOrService && (
              <p className="text-white/60 text-xs mt-0.5">For: {productOrService}</p>
            )}
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-[var(--brand-dark)] mb-2">Thank You!</h3>
            <p className="text-gray-500 text-sm">Your quote request has been submitted. We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)]/20 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Company</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Company name"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)]/20 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)]/20 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)]/20 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Product / Service</label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                placeholder="e.g. VCI Film Rolls, Export Palletization"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)]/20 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Message *</label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your packaging requirements..."
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)]/20 outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--brand-blue)] text-white py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#1a8abf] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                "Submit Quote Request"
              )}
            </button>

            <p className="text-center text-xs text-gray-400">We respond within 24 hours</p>
          </form>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
