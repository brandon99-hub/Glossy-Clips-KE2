"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_MPESA_PHONE_NUMBER || "254741991213"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-background py-16 md:py-24">
      {/* Decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 right-10 text-rose-200"
      >
        <Sparkles className="h-8 w-8" />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-10 text-rose-200"
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>

      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Image
            src="/logo.jpeg"
            alt="GLOSSYCLIPSKE"
            width={120}
            height={120}
            className="mx-auto mb-6 rounded-full shadow-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-block bg-rose-100 text-rose-600 text-sm font-medium px-4 py-1 rounded-full mb-6">
            New drops every week ✨
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-6 text-balance"
        >
          Hair Clips & Lip Gloss
          <br />
          <span className="text-rose-500">that hit different</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-muted-foreground text-lg mb-8 max-w-md mx-auto text-pretty"
        >
          Stay glossy. Stay cute. Always. 💕
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600 text-white">
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/shop?category=hair-clip">Hair Clips</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          DM us on Instagram{" "}
          <a
            href="https://instagram.com/_glossyclipke_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-500 hover:underline"
          >
            @_glossyclipke_
          </a>{" "}
          or WhatsApp{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-500 hover:underline"
          >
            +{WHATSAPP_NUMBER}
          </a>
        </motion.p>
      </div>
    </section>
  )
}
