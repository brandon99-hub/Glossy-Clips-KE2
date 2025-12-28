"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [show, setShow] = useState(true)

    useEffect(() => {
        // Show splash for 2.5 seconds
        const timer = setTimeout(() => {
            setShow(false)
            setTimeout(onComplete, 500) // Wait for fade out animation
        }, 2500)

        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50"
                >
                    <div className="text-center">
                        {/* Logo with pulse animation */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="mb-6"
                        >
                            <div className="relative w-48 h-48 mx-auto">
                                <Image
                                    src="/logo.jpeg"
                                    alt="GlossyClipsKE"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </motion.div>

                        {/* Brand name */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                                GLOSSYCLIPSKE
                            </h1>
                            <p className="text-sm font-medium bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Where Beauty Meets Confidence ✨</p>
                        </motion.div>

                        {/* Loading indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8"
                        >
                            <div className="flex justify-center gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                        className="w-2 h-2 rounded-full bg-primary"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
