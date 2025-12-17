"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

const categories = [
  {
    name: "Hair Clips",
    slug: "hair-clip",
    image: "/gold-hair-claw-clip.jpg",
    description: "Sparkle in every strand",
  },
  {
    name: "Lip Gloss",
    slug: "gloss",
    image: "/summer-fridays-vanilla-lip-gloss-pink-tube.jpg",
    description: "That perfect pout",
  },
]

export function CategoryGrid() {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group block aspect-square relative rounded-2xl overflow-hidden"
              >
                <Image
                  src={cat.image || "/placeholder.svg"}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-white/80">{cat.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
