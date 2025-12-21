"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Sparkles, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/db"
import { getProductRecommendations } from "@/app/api/waitlist/actions"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"

export function RecommendationsSection() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const { addItem } = useCart()

    useEffect(() => {
        async function loadRecommendations() {
            const result = await getProductRecommendations(6)
            if (result.success && result.products) {
                setProducts(result.products as Product[])
            }
            setLoading(false)
        }
        loadRecommendations()
    }, [])

    const handleAddToCart = (product: Product) => {
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images[0] || "",
        })
        toast.success(`${product.name} added to cart!`)
    }

    if (loading) {
        return (
            <div className="py-8">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">You Might Also Love</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-muted/50 rounded-xl h-64 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (products.length === 0) {
        return null
    }

    return (
        <div className="py-8">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">You Might Also Love</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white/60 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:shadow-lg transition-shadow group"
                    >
                        <Link href={`/product/${product.slug}`}>
                            <div className="relative aspect-square bg-muted">
                                {product.images[0] && (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                )}
                            </div>
                        </Link>
                        <div className="p-3">
                            <Link href={`/product/${product.slug}`}>
                                <h3 className="font-semibold text-sm mb-1 line-clamp-2 hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                            </Link>
                            <p className="text-lg font-bold mb-2">KES {product.price.toLocaleString()}</p>
                            <Button
                                onClick={() => handleAddToCart(product)}
                                size="sm"
                                className="w-full gap-2 bg-gradient-to-r from-rose-500 to-pink-500 h-9"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
