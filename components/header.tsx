"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.jpeg" alt="GLOSSYCLIPSKE" width={50} height={50} className="rounded-full" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/shop" className="text-sm hover:text-primary transition-colors">
            Shop
          </Link>
          <Link href="/shop?category=hair-clip" className="text-sm hover:text-primary transition-colors">
            Hair Clips
          </Link>
          <Link href="/shop?category=gloss" className="text-sm hover:text-primary transition-colors">
            Lip Gloss
          </Link>
        </nav>

        <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors">
          <ShoppingBag className="h-5 w-5" />
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium"
              >
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </header>
  )
}
