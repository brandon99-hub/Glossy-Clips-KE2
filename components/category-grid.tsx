"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useCategories } from "@/hooks/use-categories"

export function CategoryGrid() {
  const { categories } = useCategories()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate every 5 seconds (mobile shows 1 card at a time)
  useEffect(() => {
    if (categories.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % categories.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [categories.length])

  if (categories.length === 0) return null

  // Mobile: show 1 card at a time if more than 2 categories
  const visibleCard = categories.length > 2 ? categories[currentIndex] : null

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Shop by Category</h2>

        {categories.length <= 2 ? (
          // Show all cards if 2 or less
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group block aspect-square relative rounded-2xl overflow-hidden"
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-muted-foreground/20">
                        {cat.name[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-white/80 line-clamp-1">{cat.description}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          // Carousel for 3+ categories
          <div className="max-w-sm mx-auto">
            <AnimatePresence mode="popLayout">
              {visibleCard && (
                <motion.div
                  key={visibleCard.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Link
                    href={`/shop?category=${visibleCard.slug}`}
                    className="group block aspect-square relative rounded-2xl overflow-hidden"
                  >
                    {visibleCard.image ? (
                      <Image
                        src={visibleCard.image}
                        alt={visibleCard.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground/20">
                          {visibleCard.name[0]}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-semibold">{visibleCard.name}</h3>
                      {visibleCard.description && (
                        <p className="text-xs text-white/80 line-clamp-1">{visibleCard.description}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Carousel indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {categories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex
                    ? 'w-8 bg-rose-500'
                    : 'w-2 bg-gray-300'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
