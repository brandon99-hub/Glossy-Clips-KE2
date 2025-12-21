"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/lib/cart-context"
import type { PickupMtaaniLocation } from "@/lib/db"
import { toast } from "sonner"

import { Suspense } from "react"

function CartContent() {
  const { items, removeItem, updateQuantity, totalAmount, addItem } = useCart()
  const [locations, setLocations] = useState<PickupMtaaniLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<PickupMtaaniLocation | null>(null)
  const searchParams = useSearchParams()
  const isReorder = searchParams.get('reorder') === 'true'

  // Fetch Pickup Mtaani locations first
  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch("/api/pickup-locations")
        if (response.ok) {
          const data = await response.json()
          setLocations(data.locations || [])
        }
      } catch (error) {
        console.error("Error fetching locations:", error)
      }
    }
    fetchLocations()
  }, [])

  // Handle reorder items from localStorage
  useEffect(() => {
    if (isReorder) {
      const reorderItems = localStorage.getItem('reorder_items')

      if (reorderItems) {
        try {
          const items = JSON.parse(reorderItems)
          // Add each item to cart
          items.forEach((item: any) => {
            addItem({
              product_id: item.product_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || "",
            })
          })

          // Clean up reorder items
          localStorage.removeItem('reorder_items')

          toast.success("Order items added to cart!", {
            description: `${items.length} item(s) ready for checkout`,
          })
        } catch (error) {
          console.error('Failed to load reorder items:', error)
          toast.error("Failed to load order items")
        }
      }
    }
  }, [isReorder, addItem])

  // Auto-select location after locations are loaded (separate effect)
  useEffect(() => {
    if (isReorder && locations.length > 0) {
      const reorderLocationId = localStorage.getItem('reorder_location_id')

      if (reorderLocationId) {
        const loc = locations.find(l => l.id === parseInt(reorderLocationId))
        if (loc) {
          setSelectedLocation(loc)
          // Clean up after successful selection
          localStorage.removeItem('reorder_location_id')
        }
      }
    }
  }, [isReorder, locations])
  const deliveryFee = selectedLocation?.delivery_fee || 0
  const estimatedTotal = Number(totalAmount) + Number(deliveryFee)

  if (items.length === 0) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Time to treat yourself!</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/shop">
              Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product_id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-4 bg-muted rounded-xl p-3"
              >
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.name}</h3>
                  <p className="text-primary font-semibold text-sm">KES {item.price.toLocaleString()}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-background rounded-full">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pickup Location Selector - EXACT COPY from checkout */}
        <div className="bg-muted rounded-xl p-4 mb-4">
          <Label htmlFor="pickup-location">Pickup Mtaani Location</Label>
          <Select
            onValueChange={(value) => {
              const loc = locations.find((l) => l.id === parseInt(value))
              setSelectedLocation(loc || null)
            }}
            required
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id.toString()}>
                  <div className="flex items-center w-full max-w-[280px] md:max-w-md">
                    <span className="truncate">
                      {loc.name} - {loc.area} (KES {loc.delivery_fee})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Delivery fee: KES {selectedLocation?.delivery_fee || 0}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-muted rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>KES {totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="text-sm">KES {deliveryFee}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">KES {estimatedTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Gift card teaser */}
        <div className="bg-gradient-to-r from-rose-100 to-amber-50 rounded-xl p-4 mb-6 text-center">
          <span className="text-2xl">🎁</span>
          <p className="text-sm font-medium mt-1">You'll get a free gift card with this order!</p>
        </div>

        {/* Checkout Button */}
        <Button
          asChild
          size="lg"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!selectedLocation}
        >
          <Link href={`/checkout?locationId=${selectedLocation?.id || ''}`}>
            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    }>
      <CartContent />
    </Suspense>
  )
}
