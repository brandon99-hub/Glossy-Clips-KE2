"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center z-20">
          <Image src="/logo.jpeg" alt="GLOSSYCLIPSKE" width={70} height={70} className="rounded-full shadow-sm" />
        </Link>

        {/* Navigation - Centered Absolute on Desktop */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 bg-white/50 px-8 py-2 rounded-full border border-white/20 shadow-sm backdrop-blur-sm">
          <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors tracking-wide">
            Shop
          </Link>
          <Link href="/shop?category=hair-clip" className="text-sm font-medium hover:text-primary transition-colors tracking-wide">
            Hair Clips
          </Link>
          <Link href="/shop?category=gloss" className="text-sm font-medium hover:text-primary transition-colors tracking-wide">
            Lip Gloss
          </Link>
          <Link href="/bundles" className="text-sm font-medium hover:text-primary transition-colors tracking-wide">
            Bundles
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center z-20">
          <Link href="/cart" className="relative p-2.5 hover:bg-rose-50 rounded-full transition-colors group">
            <ShoppingBag className="h-5 w-5 text-gray-700 group-hover:text-rose-600 transition-colors" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md ring-2 ring-white"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </header>
  )
}
