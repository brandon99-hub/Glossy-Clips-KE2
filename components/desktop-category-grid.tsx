"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"

export function DesktopCategoryGrid() {
    const { categories } = useCategories()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (categories.length <= 2 || isPaused) return

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % categories.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [categories.length, isPaused])

    // Get visible cards (2 at a time)
    const getVisibleCards = () => {
        if (categories.length === 0) return []
        if (categories.length <= 2) return categories

        const first = categories[currentIndex]
        const second = categories[(currentIndex + 1) % categories.length]
        return [first, second]
    }

    const visibleCards = getVisibleCards()

    if (categories.length === 0) return null

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
                        <p className="text-muted-foreground">Explore our curated collections</p>
                    </div>
                    <Link href="/shop" className="text-rose-600 font-medium hover:underline flex items-center gap-1">
                        View All Products <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div
                    className="grid grid-cols-2 gap-8"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence mode="popLayout">
                        {visibleCards.map((cat, i) => (
                            <motion.div
                                key={`${cat.id}-${currentIndex}`}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.4, 0, 0.2, 1],
                                    delay: i * 0.1
                                }}
                            >
                                <Link
                                    href={`/shop?category=${cat.slug}`}
                                    className="group relative block rounded-3xl overflow-hidden h-[320px]"
                                >
                                    {/* Background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-amber-50 transition-colors duration-500" />

                                    {/* Image container */}
                                    <div className="absolute inset-0 flex items-center justify-center p-6 z-20">
                                        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-500 group-hover:scale-[1.02]">
                                            {cat.image ? (
                                                <Image
                                                    src={cat.image}
                                                    alt={cat.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                                    <span className="text-4xl font-bold text-muted-foreground/20">
                                                        {cat.name[0]}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                        </div>
                                    </div>

                                    {/* Text overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-30 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                                                    {cat.description && (
                                                        <p className="text-muted-foreground text-sm line-clamp-1">
                                                            {cat.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="h-10 w-10 bg-rose-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Carousel indicators */}
                {categories.length > 2 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {categories.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex || i === (currentIndex + 1) % categories.length
                                    ? 'w-8 bg-rose-500'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
