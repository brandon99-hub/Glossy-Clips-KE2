"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const categories = [
    {
        name: "Hair Clips",
        slug: "hair-clip",
        image: "/gold-hair-claw-clip.jpg",
        description: "Sparkle in every strand with our premium collection",
        color: "bg-amber-50"
    },
    {
        name: "Lip Gloss",
        slug: "gloss",
        image: "/summer-fridays-vanilla-lip-gloss-pink-tube.jpg",
        description: "Hydrating, non-sticky formulas for the perfect pout",
        color: "bg-rose-50"
    },
]

export function DesktopCategoryGrid() {
    return (
        <section className="py-20 px-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
                        <p className="text-muted-foreground">Explore our curated collections</p>
                    </div>
                    <Link href="/shop" className="text-rose-600 font-medium hover:underline flex items-center gap-1">
                        View All Products <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link
                                href={`/shop?category=${cat.slug}`}
                                className="group relative block rounded-3xl overflow-hidden h-[400px]"
                            >
                                <div className={`absolute inset-0 ${cat.color} transition-colors duration-500`} />

                                <div className="absolute inset-0 flex items-center justify-center p-8 z-20">
                                    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-500 group-hover:scale-[1.02]">
                                        <Image
                                            src={cat.image || "/placeholder.svg"}
                                            alt={cat.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-8 z-30 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">{cat.name}</h3>
                                                <p className="text-muted-foreground text-sm">{cat.description}</p>
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
                </div>
            </div>
        </section>
    )
}
