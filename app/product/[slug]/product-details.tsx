"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/db"

export function ProductDetails({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      quantity,
      price: product.price,
      image: product.images[0] || "/placeholder.svg?height=100&width=100",
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="py-4 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back button */}
        <Link
          href="/shop"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to shop
        </Link>

        {/* Image Gallery */}
        <div className="mb-6">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3"
          >
            <Image
              src={product.images[selectedImage] || "/placeholder.svg?height=500&width=500"}
              alt={product.name}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {product.images.length > 1 && (
            <div className="flex gap-2 justify-center">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} ${i + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <span className="text-sm text-muted-foreground capitalize">
            {product.category === "hair-charm" ? "Hair Charm" : "Gloss"}
          </span>
          <h1 className="text-2xl font-bold mt-1 mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mb-4">KES {product.price.toLocaleString()}</p>
          <p className="text-muted-foreground mb-6">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-2 bg-muted rounded-full p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90" onClick={handleAddToCart}>
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center"
                  >
                    <Check className="h-5 w-5 mr-2" /> Added to cart!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" /> Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Gift card teaser */}
          <p className="text-center text-sm text-muted-foreground mt-4">Free gift card with every order</p>
        </div>
      </div>
    </div>
  )
}
