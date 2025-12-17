"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

interface Bundle {
  id: number
  name: string
  description: string
  product_ids: number[]
  original_price: number
  bundle_price: number
  savings: number
  products?: { id: number; name: string; images: string[] }[]
}

export function BundleCard({ bundle }: { bundle: Bundle }) {
  const { addItem } = useCart()

  const handleAddBundle = () => {
    addItem({
      id: `bundle-${bundle.id}`,
      name: bundle.name,
      price: bundle.bundle_price,
      image: bundle.products?.[0]?.images?.[0] || "/placeholder.svg",
      quantity: 1,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-4 relative overflow-hidden"
    >
      {/* Savings badge */}
      <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        Save KES {bundle.savings.toLocaleString()}
      </div>

      {/* Product images */}
      <div className="flex -space-x-4 mb-4">
        {bundle.products?.slice(0, 3).map((product, i) => (
          <div
            key={product.id}
            className="w-16 h-16 rounded-full border-2 border-background overflow-hidden bg-muted relative"
            style={{ zIndex: 3 - i }}
          >
            <Image src={product.images?.[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>
        ))}
        {bundle.products && bundle.products.length > 3 && (
          <div className="w-16 h-16 rounded-full border-2 border-background bg-muted flex items-center justify-center text-sm font-medium">
            +{bundle.products.length - 3}
          </div>
        )}
      </div>

      <h3 className="font-semibold mb-1">{bundle.name}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{bundle.description}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-primary">KES {bundle.bundle_price.toLocaleString()}</span>
        <span className="text-sm line-through text-muted-foreground">KES {bundle.original_price.toLocaleString()}</span>
      </div>

      <Button onClick={handleAddBundle} className="w-full" size="sm">
        Add Bundle to Cart
      </Button>
    </motion.div>
  )
}
