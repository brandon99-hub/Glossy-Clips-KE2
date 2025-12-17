"use client"

import Image from "next/image"
import { motion } from "framer-motion"
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

const TestimonialsPage = ({ testimonials }: { testimonials: Testimonial[] }) => {
  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">The Love</h1>
        <p className="text-muted-foreground text-center mb-8">Real messages from real girlies</p>

        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-muted rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <Image
                  src={t.profile_image || "/placeholder.svg?height=60&width=60"}
                  alt={t.username}
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">@{t.username}</p>
                  <div className="bg-background rounded-2xl rounded-tl-none px-4 py-3 mt-2 shadow-sm">
                    <p className="text-sm leading-relaxed">{t.message}</p>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {t.emoji_reactions?.split(",").map((emoji, j) => (
                      <span key={j} className="text-lg">
                        {emojiMap[emoji] || emoji}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No testimonials yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestimonialsPage
