"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"

const WHATSAPP_NUMBER = "254745717591"

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    const message = encodeURIComponent("Hey! I have a question about your products on GLOSSYCLIPSKE")
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank")
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-3 shadow-lg whitespace-nowrap"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 bg-muted rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-sm font-medium">Need help? Chat with us!</p>
            <p className="text-xs text-muted-foreground">Usually replies within minutes</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#25D366] hover:bg-[#20BD5A] text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" fill="white" />
      </motion.button>
    </div>
  )
}
