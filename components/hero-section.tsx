"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_MPESA_PHONE_NUMBER || "254741991213"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50/30 to-background py-12 sm:py-16 md:py-24">
      {/* Decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-6 sm:top-10 right-6 sm:right-10 text-rose-200"
      >
        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-16 sm:bottom-20 left-6 sm:left-10 text-rose-200"
      >
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Image
            src="/logo.jpeg"
            alt="GLOSSYCLIPSKE"
            width={100}
            height={100}
            className="mx-auto mb-4 sm:mb-6 rounded-full shadow-lg ring-4 ring-rose-100/50 w-[100px] h-[100px] sm:w-[120px] sm:h-[120px]"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-block bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 shadow-sm">
            New drops every week ✨
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 text-balance leading-tight px-2"
        >
          Hair Clips & Lip Gloss
          <br />
          <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            that hit different
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-muted-foreground text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-md mx-auto text-pretty px-4"
        >
          Stay glossy. Stay cute. Always. 💕
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200 h-12 sm:h-11 text-base font-bold rounded-xl"
          >
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-rose-200 hover:bg-rose-50 h-12 sm:h-11 text-base font-semibold rounded-xl"
          >
            <Link href="/shop?category=hair-clip">Hair Clips</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground px-4"
        >
          DM us on Instagram{" "}
          <a
            href="https://instagram.com/_glossyclipke_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-500 hover:underline font-medium"
          >
            @_glossyclipke_
          </a>{" "}
          or WhatsApp{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-500 hover:underline font-medium"
          >
            +{WHATSAPP_NUMBER}
          </a>
        </motion.p>
      </div>
    </section>
  )
}
