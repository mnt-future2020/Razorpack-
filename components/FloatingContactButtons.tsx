"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, X, MessageCircle } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { useContact } from "@/hooks/use-contact";

export default function FloatingContactButtons() {
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);
  const [showCallTooltip, setShowCallTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { contactInfo } = useContact();
  const pathname = usePathname();

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide floating buttons on admin and login pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  const handleWhatsAppClick = () => {
    const message = "Hi! I'm interested in your industrial packaging solutions. Please provide more details.";
    const whatsappNumber = contactInfo?.whatsappNumber || "";
    if (!whatsappNumber) return;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallClick = () => {
    const phoneNumber = contactInfo?.primaryPhone || "";
    if (!phoneNumber) return;
    window.open(`tel:${phoneNumber}`, '_self');
  };

  if (!contactInfo?.primaryPhone && !contactInfo?.whatsappNumber) return null;

  // Mobile: Collapsible FAB menu
  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-3 mb-3"
            >
              {/* WhatsApp Button */}
              {contactInfo?.whatsappNumber && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button
                    onClick={handleWhatsAppClick}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full w-12 h-12 shadow-lg"
                    aria-label="Contact via WhatsApp"
                  >
                    <WhatsAppIcon className="h-6 w-6" />
                  </Button>
                </motion.div>
              )}

              {/* Call Button */}
              {contactInfo?.primaryPhone && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.15 }}
                >
                  <Button
                    onClick={handleCallClick}
                    className="bg-[var(--brand-dark)] hover:bg-[#013a5a] text-white rounded-full w-12 h-12 shadow-lg"
                    aria-label="Call us"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB toggle button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`rounded-full w-14 h-14 shadow-2xl transition-all duration-300 ${
              isExpanded 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-[var(--brand-blue)] hover:bg-[#e07310]'
            }`}
            aria-label={isExpanded ? "Close contact menu" : "Open contact menu"}
            aria-expanded={isExpanded}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isExpanded ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <MessageCircle className="h-6 w-6 text-white" />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </div>
    );
  }

  // Desktop: Smooth animated layout
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      {/* WhatsApp Button */}
      {contactInfo?.whatsappNumber && (
        <motion.div 
          className="relative group"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={handleWhatsAppClick}
              onMouseEnter={() => setShowWhatsAppTooltip(true)}
              onMouseLeave={() => setShowWhatsAppTooltip(false)}
              onFocus={() => setShowWhatsAppTooltip(true)}
              onBlur={() => setShowWhatsAppTooltip(false)}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full w-14 h-14 shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 relative overflow-hidden group"
              aria-label={`Contact via WhatsApp: ${contactInfo.whatsappNumber}`}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <WhatsAppIcon className="h-7 w-7 relative z-10" />
              </motion.div>
              
              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 bg-white rounded-full"
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </Button>
          </motion.div>
          
          <AnimatePresence>
            {showWhatsAppTooltip && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-[var(--brand-dark)] text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl"
                role="tooltip"
              >
                WhatsApp: {contactInfo.whatsappNumber}
                <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-[var(--brand-dark)] border-t-4 border-t-transparent border-b-4 border-b-transparent" aria-hidden="true"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Call Button */}
      {contactInfo?.primaryPhone && (
        <motion.div 
          className="relative group"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <motion.div
            whileHover={{ scale: 1.15, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={handleCallClick}
              onMouseEnter={() => setShowCallTooltip(true)}
              onMouseLeave={() => setShowCallTooltip(false)}
              onFocus={() => setShowCallTooltip(true)}
              onBlur={() => setShowCallTooltip(false)}
              className="bg-[var(--brand-dark)] hover:bg-[var(--brand-blue)] text-white rounded-full w-14 h-14 shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 relative overflow-hidden"
              aria-label={`Call us: ${contactInfo.primaryPhone}`}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1
                }}
              >
                <Phone className="h-6 w-6 relative z-10" />
              </motion.div>
              
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 bg-[var(--brand-blue)] rounded-full"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </Button>
          </motion.div>
          
          <AnimatePresence>
            {showCallTooltip && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-[var(--brand-dark)] text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl"
                role="tooltip"
              >
                Call: {contactInfo.primaryPhone}
                <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-[var(--brand-dark)] border-t-4 border-t-transparent border-b-4 border-b-transparent" aria-hidden="true"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
