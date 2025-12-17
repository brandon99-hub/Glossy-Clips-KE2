"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import confetti from "canvas-confetti"
import { X, Home, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GiftCardRevealModal() {
    const [showModal, setShowModal] = useState(false)
    const [isRevealed, setIsRevealed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)

        // Show modal after 2 seconds
        const timer = setTimeout(() => {
            setShowModal(true)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    const handleReveal = () => {
        setIsRevealed(true)
        triggerConfetti()
    }

    const triggerConfetti = () => {
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ["#f43f5e", "#ec4899", "#fbbf24", "#a855f7"],
            })
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ["#f43f5e", "#ec4899", "#fbbf24", "#a855f7"],
            })
        }, 250)
    }

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    {/* Close button */}
                    <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    {/* Modal content */}
                    <div className="w-full max-w-3xl">
                        <AnimatePresence mode="wait">
                            {!isRevealed ? (
                                isMobile ? (
                                    <ScratchCard key="scratch" onReveal={handleReveal} />
                                ) : (
                                    <EnvelopeCard key="envelope" onReveal={handleReveal} />
                                )
                            ) : (
                                <RevealedCard key="revealed" onClose={() => setShowModal(false)} />
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Improved envelope animation for desktop
function EnvelopeCard({ onReveal }: { onReveal: () => void }) {
    const [isOpening, setIsOpening] = useState(false)
    const [showCard, setShowCard] = useState(false)

    const handleClick = () => {
        if (isOpening) return
        setIsOpening(true)
        setTimeout(() => setShowCard(true), 600)
        setTimeout(onReveal, 1200)
    }

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative cursor-pointer"
            onClick={handleClick}
            style={{ perspective: "1500px" }}
        >
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-visible">
                {/* Envelope back */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 rounded-3xl shadow-2xl border-4 border-rose-300" />

                {/* Gift card sliding out */}
                <AnimatePresence>
                    {showCard && (
                        <motion.div
                            initial={{ y: 0, scale: 0.7, opacity: 0 }}
                            animate={{ y: -80, scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-x-12 top-12 z-20"
                        >
                            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/50">
                                <Image
                                    src="/gift-card.jpeg"
                                    alt="Gift Card"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Envelope flap - improved visibility */}
                <motion.div
                    animate={
                        isOpening
                            ? { rotateX: 180, y: -30 }
                            : { rotateX: 0, y: 0 }
                    }
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{
                        transformOrigin: "top center",
                        transformStyle: "preserve-3d",
                    }}
                    className="absolute inset-x-0 top-0 h-1/2 z-10"
                >
                    {/* Flap front (visible when closed) */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-rose-300 via-pink-300 to-rose-400 rounded-t-3xl border-4 border-rose-400 border-b-0 shadow-lg"
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-8xl mb-3">🎁</div>
                                <p className="text-white font-bold text-2xl drop-shadow-lg">Free Gift!</p>
                            </div>
                        </div>
                        {/* Triangle flap bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
                            <div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
                                style={{
                                    borderLeft: "300px solid transparent",
                                    borderRight: "300px solid transparent",
                                    borderTop: "48px solid #fb7185",
                                }}
                            />
                        </div>
                    </div>

                    {/* Flap back (visible when open) */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 rounded-t-3xl border-4 border-rose-500 border-b-0"
                        style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
                    />
                </motion.div>

                {/* Tap hint */}
                {!isOpening && (
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30"
                    >
                        <div className="bg-white px-8 py-4 rounded-full shadow-2xl border-2 border-rose-400">
                            <p className="text-rose-600 font-bold text-lg">👆 Tap to open your gift!</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

// Scratch card for mobile
function ScratchCard({ onReveal }: { onReveal: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [scratchPercentage, setScratchPercentage] = useState(0)
    const [hasRevealed, setHasRevealed] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas size
        canvas.width = canvas.offsetWidth * 2
        canvas.height = canvas.offsetHeight * 2
        ctx.scale(2, 2)

        // Draw silver overlay
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, "#C0C0C0")
        gradient.addColorStop(0.5, "#E8E8E8")
        gradient.addColorStop(1, "#C0C0C0")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add text
        ctx.font = "bold 24px Poppins"
        ctx.fillStyle = "#666"
        ctx.textAlign = "center"
        ctx.fillText("✨ Scratch to reveal ✨", canvas.width / 4, canvas.height / 4)
    }, [])

    const handleScratch = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left
        const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top

        // Erase circular area
        ctx.globalCompositeOperation = "destination-out"
        ctx.beginPath()
        ctx.arc(x * 2, y * 2, 80, 0, Math.PI * 2)
        ctx.fill()

        // Calculate scratch percentage
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let transparent = 0
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++
        }
        const percentage = (transparent / (pixels.length / 4)) * 100
        setScratchPercentage(percentage)

        // Trigger reveal at 50%
        if (percentage > 50 && !hasRevealed) {
            setHasRevealed(true)
            setTimeout(onReveal, 500)
        }
    }

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative"
        >
            <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/50">
                {/* Gift card image underneath */}
                <Image
                    src="/gift-card.jpeg"
                    alt="Gift Card"
                    fill
                    className="object-cover"
                />

                {/* Scratch overlay */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full touch-none"
                    onTouchMove={handleScratch}
                    onMouseMove={(e) => e.buttons === 1 && handleScratch(e)}
                />
            </div>
        </motion.div>
    )
}

// Revealed card with navigation buttons
function RevealedCard({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
        >
            {/* Gift card */}
            <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/50 mb-8">
                <Image
                    src="/gift-card.jpeg"
                    alt="Gift Card"
                    fill
                    className="object-cover"
                />

                {/* Decorative sparkles */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-400 rounded-full blur-2xl opacity-50 animate-pulse" />
            </div>

            {/* Thank you message */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
            >
                <h2 className="text-white text-4xl font-bold mb-2">Thank You! 💖</h2>
                <p className="text-white/80 text-lg">You're amazing! Enjoy your free gift card ✨</p>
            </motion.div>

            {/* Navigation buttons */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-medium h-12"
                    onClick={onClose}
                >
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back Home
                    </Link>
                </Button>
                <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-medium h-12"
                    onClick={onClose}
                >
                    <Link href="/shop">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
            </motion.div>
        </motion.div>
    )
}
