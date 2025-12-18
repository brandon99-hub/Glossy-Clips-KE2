"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface SwipeNavigationProps {
    children: React.ReactNode
    currentPage: "home" | "shop"
}

export function SwipeNavigation({ children, currentPage }: SwipeNavigationProps) {
    const router = useRouter()

    useEffect(() => {
        let touchStartX = 0
        let touchEndX = 0

        const minSwipeDistance = 50 // Minimum distance for swipe to trigger

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX
        }

        const handleTouchEnd = (e: TouchEvent) => {
            touchEndX = e.changedTouches[0].screenX
            handleSwipe()
        }

        const handleSwipe = () => {
            const swipeDistance = touchEndX - touchStartX

            // Swipe left (right to left) - go to shop
            if (swipeDistance < -minSwipeDistance && currentPage === "home") {
                router.push("/shop")
            }

            // Swipe right (left to right) - go to home
            if (swipeDistance > minSwipeDistance && currentPage === "shop") {
                router.push("/")
            }
        }

        // Only add listeners on mobile
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            document.addEventListener("touchstart", handleTouchStart)
            document.addEventListener("touchend", handleTouchEnd)
        }

        return () => {
            document.removeEventListener("touchstart", handleTouchStart)
            document.removeEventListener("touchend", handleTouchEnd)
        }
    }, [currentPage, router])

    return <>{children}</>
}
