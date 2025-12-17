"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount } = useCart()
  const [deliveryMethod, setDeliveryMethod] = useState<"self-pickup" | "pickup-mtaani">("self-pickup")

  const estimatedDeliveryFee = deliveryMethod === "pickup-mtaani" ? 100 : 0
  const estimatedTotal = totalAmount + estimatedDeliveryFee

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

        {/* Delivery Method Selector */}
        <div className="bg-muted rounded-xl p-4 mb-4">
          <Label className="text-sm font-medium mb-3 block">Delivery Method</Label>
          <RadioGroup value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="self-pickup" id="self" />
              <Label htmlFor="self" className="font-normal cursor-pointer text-sm">
                Self Pickup (Free)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup-mtaani" id="mtaani" />
              <Label htmlFor="mtaani" className="font-normal cursor-pointer text-sm">
                Pickup Mtaani (KES 100-150)
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-2">
            {deliveryMethod === "pickup-mtaani"
              ? "Select exact location at checkout"
              : "We'll send you pickup details after payment"}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-muted rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>KES {totalAmount.toLocaleString()}</span>
          </div>
          {deliveryMethod === "pickup-mtaani" && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-sm">~KES {estimatedDeliveryFee}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">
              {deliveryMethod === "pickup-mtaani" ? "~" : ""}KES {estimatedTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Gift card teaser */}
        <div className="bg-gradient-to-r from-rose-100 to-amber-50 rounded-xl p-4 mb-6 text-center">
          <span className="text-2xl">🎁</span>
          <p className="text-sm font-medium mt-1">You'll get a free gift card with this order!</p>
        </div>

        {/* Checkout Button */}
        <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/checkout?delivery=${deliveryMethod}`}>
            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
