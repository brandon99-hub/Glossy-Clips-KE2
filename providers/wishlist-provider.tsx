"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type WishlistContextType = {
  wishlistItems: number[] // Array of product IDs
  addToWishlist: (productId: number) => void
  removeFromWishlist: (productId: number) => void
  isInWishlist: (productId: number) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load wishlist from localStorage on mount and sync across tabs/pages
  useEffect(() => {
    const stored = localStorage.getItem("glossy_wishlist")
    if (stored) {
      try {
        setWishlistItems(JSON.parse(stored))
      } catch {
        setWishlistItems([])
      }
    }
    setIsLoaded(true)

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "glossy_wishlist" && e.newValue) {
        try {
          setWishlistItems(JSON.parse(e.newValue))
        } catch {}
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("glossy_wishlist", JSON.stringify(wishlistItems))
    }
  }, [wishlistItems, isLoaded])

  const addToWishlist = (productId: number) => {
    setWishlistItems((prev) => {
      if (prev.includes(productId)) return prev
      return [...prev, productId]
    })
  }

  const removeFromWishlist = (productId: number) => {
    setWishlistItems((prev) => prev.filter((id) => id !== productId))
  }

  const isInWishlist = (productId: number) => {
    return wishlistItems.includes(productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
