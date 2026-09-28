"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem } from "@/types/db"

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount and sync across tabs/pages
  useEffect(() => {
    const stored = localStorage.getItem("charm-cart")
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse cart", e)
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "charm-cart" && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue))
        } catch (err) {
          console.error("Failed to parse updated cart", err)
        }
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("charm-cart", JSON.stringify(items))
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === newItem.product_id)
      if (existing) {
        return prev.map((i) =>
          i.product_id === newItem.product_id ? { ...i, quantity: i.quantity + newItem.quantity } : i,
        )
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) => prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i)))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
