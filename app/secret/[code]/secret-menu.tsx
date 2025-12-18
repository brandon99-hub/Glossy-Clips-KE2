"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Lock, Clock, ShoppingBag, Check, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { SecretCode, Product } from "@/lib/db"
import { toast } from "sonner"

function SecretRevealAnimation({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),  // Lock spinning
      setTimeout(() => setStep(2), 1600), // Unlock
      setTimeout(() => setStep(3), 2400), // Sparkles explosion
      setTimeout(() => setStep(4), 3200), // Text reveal
      setTimeout(() => onComplete(), 4200), // Complete
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="lock"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-rose-500"
          >
            <Lock className="w-24 h-24" />
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            key="unlock"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-amber-400"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Sparkles className="w-24 h-24" />
            </motion.div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="sparkles"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.5, 1.2] }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Sparkles className="w-32 h-32 text-amber-400" />
            {/* Particle effect simulation */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI) / 4) * 100,
                  y: Math.sin((i * Math.PI) / 4) * 100,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-amber-400 rounded-full"
              />
            ))}
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center"
          >
            <motion.p
              className="text-white text-4xl font-bold mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: 1 }}
            >
              🎉 UNLOCKED! 🎉
            </motion.p>
            <p className="text-rose-400 text-xl">Welcome to the secret</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SecretMenuPage({
  secretCode,
  products,
  isExpired,
  alreadyScanned,
}: {
  secretCode: SecretCode
  products: Product[]
  isExpired: boolean
  alreadyScanned: boolean
}) {
  const [showReveal, setShowReveal] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const { addItem } = useCart()
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set())

  // Store secret code in localStorage for checkout tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_secret_code', secretCode.code)
    }
  }, [secretCode.code])

  const handleAddToCart = (product: Product) => {
    addItem({
      product_id: product.id,
      name: product.name,
      quantity: 1,
      price: product.price * (1 - secretCode.discount_percent / 100), // Apply discount
      image: product.images[0] || "/placeholder.svg?height=100&width=100",
    })
    setAddedProducts((prev) => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedProducts((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 2000)
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white">
        <div className="text-center">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">This secret has expired</h1>
          <p className="text-muted-foreground mb-6">The code you used is no longer valid</p>
          <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
            <Link href="/shop">Visit Regular Shop</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (secretCode.is_used) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white">
        <div className="text-center">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Already used</h1>
          <p className="text-muted-foreground mb-6">This secret code has already been redeemed</p>
          <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
            <Link href="/shop">Visit Regular Shop</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (alreadyScanned) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Already Scanned</h1>
          <p className="text-muted-foreground mb-4">This QR code has already been scanned once.</p>
          <p className="text-sm text-amber-400 mb-6">
            Each secret code can only be scanned one time to maintain exclusivity.
            If you scanned this code, you should have already seen the secret products!
          </p>
          <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
            <Link href="/shop">Visit Regular Shop</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {showReveal && !revealed && (
        <SecretRevealAnimation
          onComplete={() => {
            setRevealed(true)
            setShowReveal(false)
          }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-black via-rose-950 to-black text-white">
        {/* Header */}
        <div className="text-center py-12 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-4 py-2 rounded-full text-sm mb-4">
              <Sparkles className="w-4 h-4" /> Secret Menu
            </span>
            <h1 className="text-3xl font-bold mb-2">You found the secret 💋</h1>
            <p className="text-white/60 max-w-md mx-auto">
              Welcome to the exclusive zone. These drops are only for those who know.
            </p>
          </motion.div>
        </div>

        {/* Discount Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-4 mb-6"
        >
          <div className="max-w-lg mx-auto bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl p-6 text-center shadow-lg shadow-rose-500/20">
            <Gift className="w-8 h-8 mx-auto mb-2" />
            <p className="text-lg font-bold">{secretCode.discount_percent}% OFF</p>
            <p className="text-sm text-white/80">Auto-applied to secret items</p>
          </div>
        </motion.div>

        {/* Secret Code Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-4 mb-6"
        >
          <div className="max-w-lg mx-auto bg-black/40 backdrop-blur border border-rose-500/30 rounded-xl p-4">
            <p className="text-xs text-white/60 mb-2 text-center">Your Secret Code</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-lg font-mono font-bold text-rose-300 tracking-wider">
                {secretCode.code}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(secretCode.code)
                  toast.success("Code copied!")
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Copy code"
              >
                📋
              </button>
            </div>
            {secretCode.expires_at && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-amber-400 text-center flex items-center justify-center gap-2">
                  <Clock className="w-3 h-3" />
                  Expires: {new Date(secretCode.expires_at).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            )}
            <p className="text-xs text-white/40 mt-2 text-center">
              One-time use • Keep it secret! 🤫
            </p>
          </div>
        </motion.div>

        {/* Products */}
        <div className="px-4 pb-24">
          <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-semibold mb-4 text-white/80">Exclusive Drops</h2>
            <div className="grid grid-cols-2 gap-4">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/5 backdrop-blur rounded-2xl overflow-hidden border border-white/10 hover:border-rose-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20"
                >
                  <div className="aspect-square relative group">
                    <Image
                      src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-rose-500 text-xs px-2 py-1 rounded-full animate-pulse">✨ Exclusive</span>
                    {/* Glow overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-rose-400 font-bold">
                        KES {Math.round(product.price * (1 - secretCode.discount_percent / 100)).toLocaleString()}
                      </span>
                      <span className="text-white/40 text-xs line-through">KES {product.price.toLocaleString()}</span>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      size="sm"
                      className="w-full bg-white text-black hover:bg-white/90"
                    >
                      <AnimatePresence mode="wait">
                        {addedProducts.has(product.id) ? (
                          <motion.span
                            key="added"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center"
                          >
                            <Check className="w-4 h-4 mr-1" /> Added
                          </motion.span>
                        ) : (
                          <motion.span
                            key="add"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center"
                          >
                            <ShoppingBag className="w-4 h-4 mr-1" /> Add
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12 text-white/60">
                <p>No secret items available right now</p>
                <p className="text-sm mt-2">Check back soon for new drops!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur border-t border-white/10 p-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <Link href="/shop" className="text-white/60 text-sm hover:text-white transition-colors">
              Regular Shop
            </Link>
            <Link href="/cart">
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                <ShoppingBag className="w-4 h-4 mr-2" /> View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
