"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { Testimonial } from "@/lib/db"

const emojiMap: Record<string, string> = {
  fire: "🔥",
  heart: "❤️",
  sparkles: "✨",
  crying: "😭",
  gift: "🎁",
  laughing: "😂",
  hundred: "💯",
  skull: "💀",
  money: "💸",
  heart_eyes: "😍",
}

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  if (!testimonials.length) return null

  return (
    <div className="relative overflow-hidden py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-muted rounded-2xl p-4 max-w-sm mx-auto"
        >
          {/* DM Style */}
          <div className="flex items-start gap-3">
            <Image
              src={
                !testimonials[current].profile_image || testimonials[current].profile_image.includes("placeholder.svg")
                  ? "/pfp.jpg"
                  : testimonials[current].profile_image
              }
              alt={testimonials[current].username}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">@{testimonials[current].username}</p>
              <div className="bg-background rounded-2xl rounded-tl-none px-4 py-2 mt-1 shadow-sm">
                <p className="text-sm">{testimonials[current].message}</p>
              </div>
              <div className="flex gap-1 mt-2">
                {testimonials[current].emoji_reactions?.split(",").map((emoji, i) => (
                  <span key={i} className="text-lg">
                    {emojiMap[emoji] || emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === current ? "bg-primary" : "bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
