"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import { sql, type Product } from "@/lib/db"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist()
    const { addItem } = useCart()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadWishlistProducts() {
            if (wishlistItems.length === 0) {
                setLoading(false)
                return
            }

            try {
                // Fetch products from wishlist
                const response = await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productIds: wishlistItems }),
                })

                if (response.ok) {
                    const data = await response.json()
                    setProducts(data.products)
                }
            } catch (error) {
                console.error("Error loading wishlist:", error)
            } finally {
                setLoading(false)
            }
        }

        loadWishlistProducts()
    }, [wishlistItems])

    if (loading) {
        return (
            <div className="py-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <p className="text-muted-foreground">Loading your wishlist...</p>
                </div>
            </div>
        )
    }

    if (wishlistCount === 0) {
        return (
            <div className="py-16 px-4">
                <div className="container mx-auto max-w-md text-center">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h1>
                    <p className="text-muted-foreground mb-6">
                        Start adding items you love to your wishlist!
                    </p>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/shop">Browse Shop</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
                        <p className="text-muted-foreground">
                            {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="relative">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
