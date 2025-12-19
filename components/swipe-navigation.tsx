"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, animate } from "framer-motion"

interface SwipeNavigationProps {
    children: React.ReactNode
    currentPage: "home" | "shop"
}

export function SwipeNavigation({ children, currentPage }: SwipeNavigationProps) {
    const router = useRouter()
    const [isDragging, setIsDragging] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const x = useMotionValue(0)

    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const touchCurrentX = useRef(0)
    const touchCurrentY = useRef(0)
    const isHorizontalSwipe = useRef(false)

    // Check if mobile on mount to avoid hydration mismatch
    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])

    useEffect(() => {
        // Only on mobile
        if (!isMobile) return

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX
            touchStartY.current = e.touches[0].clientY
            isHorizontalSwipe.current = false
        }

        const handleTouchMove = (e: TouchEvent) => {
            touchCurrentX.current = e.touches[0].clientX
            touchCurrentY.current = e.touches[0].clientY

            const deltaX = Math.abs(touchCurrentX.current - touchStartX.current)
            const deltaY = Math.abs(touchCurrentY.current - touchStartY.current)

            // Determine if this is a horizontal swipe
            if (deltaX > 10 && deltaX > deltaY && !isHorizontalSwipe.current) {
                isHorizontalSwipe.current = true
            }

            // If horizontal swipe detected, update position and prevent scroll
            if (isHorizontalSwipe.current) {
                e.preventDefault() // Prevent vertical scroll
                setIsDragging(true)

                const diff = touchCurrentX.current - touchStartX.current

                // Constrain drag based on current page
                if (currentPage === "home" && diff > 0) {
                    // Can't swipe right from home
                    x.set(0)
                } else if (currentPage === "shop" && diff < 0) {
                    // Can't swipe left from shop
                    x.set(0)
                } else {
                    x.set(diff)
                }
            }
        }

        const handleTouchEnd = () => {
            if (!isHorizontalSwipe.current) {
                setIsDragging(false)
                return
            }

            const swipeDistance = touchCurrentX.current - touchStartX.current
            const threshold = window.innerWidth * 0.4 // 40% threshold

            // Swipe left from home (go to shop)
            if (swipeDistance < -threshold && currentPage === "home") {
                // Animate to completion
                animate(x, -window.innerWidth, {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    onComplete: () => {
                        router.push("/shop")
                    }
                })
            }
            // Swipe right from shop (go to home)
            else if (swipeDistance > threshold && currentPage === "shop") {
                // Animate to completion
                animate(x, window.innerWidth, {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    onComplete: () => {
                        router.push("/")
                    }
                })
            }
            // Snap back
            else {
                animate(x, 0, {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                })
            }

            setIsDragging(false)
            isHorizontalSwipe.current = false
        }

        document.addEventListener("touchstart", handleTouchStart, { passive: true })
        document.addEventListener("touchmove", handleTouchMove, { passive: false })
        document.addEventListener("touchend", handleTouchEnd)

        return () => {
            document.removeEventListener("touchstart", handleTouchStart)
            document.removeEventListener("touchmove", handleTouchMove)
            document.removeEventListener("touchend", handleTouchEnd)
        }
    }, [currentPage, router, x, isMobile])

    // Prefetch both pages for instant navigation
    useEffect(() => {
        if (isMobile) {
            router.prefetch("/")
            router.prefetch("/shop")
        }
    }, [router, isMobile])

    // Only apply transform on mobile
    if (!isMobile) {
        return <>{children}</>
    }

    return (
        <motion.div
            style={{ x }}
            className="touch-pan-y"
        >
            {children}
        </motion.div>
    )
}
