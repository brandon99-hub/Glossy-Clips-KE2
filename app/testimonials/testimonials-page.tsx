"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { Testimonial } from "@/lib/db"
import { useState } from "react"
import { submitTestimonial } from "./actions"
import { toast } from "sonner"
import { Send, Loader2, MessageCircle, X, ChevronDown } from "lucide-react"

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
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("message", message)

      const result = await submitTestimonial(formData)

      if (result.success) {
        toast.success("Thanks for sharing the love! 💕")
        setUsername("")
        setMessage("")
        setIsFormOpen(false)
      } else {
        toast.error(result.error || "Failed to submit")
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8 px-4 pb-24">
      <div className="container mx-auto max-w-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">The Love</h1>
        <p className="text-muted-foreground text-center mb-8">Real messages from real girlies</p>

        <div className="space-y-4 mb-8">
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
          <div className="text-center py-12 mb-8">
            <p className="text-muted-foreground">No testimonials yet</p>
          </div>
        )}

        {/* Floating Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-rose-500 to-amber-500 text-white p-4 rounded-full shadow-2xl hover:shadow-rose-500/50 transition-shadow z-40"
        >
          {isFormOpen ? <ChevronDown className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </motion.button>

        {/* Semi-transparent Backdrop */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/20 z-20"
            />
          )}
        </AnimatePresence>

        {/* Bottom Sheet Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-30 max-h-[75vh] overflow-y-auto bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/95 dark:to-amber-950/95 rounded-t-3xl shadow-2xl"
            >
              <div className="p-6">
                {/* Drag Handle */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <h3 className="font-bold text-lg">Send Your Love</h3>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username Input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="yourname"
                      required
                      maxLength={30}
                      disabled={loading}
                      className="w-full pl-7 pr-3 py-3 bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div className="relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message... (you can use emojis! 💕✨)"
                      required
                      maxLength={280}
                      rows={4}
                      disabled={loading}
                      className="w-full px-3 py-3 bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-800 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/280</p>
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={loading || !username.trim() || !message.trim()}
                    className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-medium py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send 💕
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-muted-foreground">
                    Your message will be reviewed before appearing
                  </p>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TestimonialsPage
