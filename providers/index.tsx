"use client"

import type React from "react"
import { AuthProvider } from "./auth-provider"
import { CartProvider } from "./cart-provider"
import { WishlistProvider } from "./wishlist-provider"

export { AuthProvider } from "./auth-provider"
export { CartProvider, useCart } from "./cart-provider"
export { WishlistProvider, useWishlist } from "./wishlist-provider"
export { ThemeProvider } from "./theme-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
