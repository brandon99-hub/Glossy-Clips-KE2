"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    Package, MapPin, User, LogOut, Trash2, Plus,
    ShoppingBag, Clock, CheckCircle, Truck, Star,
    AlertCircle, Loader2, RefreshCcw, Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signOut } from "next-auth/react"
import type { Order, CustomerAddress } from "@/lib/db"
import {
    updateCustomerProfile,
    addCustomerAddress,
    deleteCustomerAddress,
    reorderItems,
    deleteCustomerAccount,
} from "./actions"
import { RecommendationsSection } from "@/components/recommendations-section"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/db"
import { toast } from "sonner"

type DashboardClientProps = {
    orders: Order[]
    customer: {
        id: number
        email: string
        name: string | null
        phone_number: string | null
        created_at: string
    }
    addresses: CustomerAddress[]
}

const statusConfig = {
    pending: { label: "Payment Pending", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
    paid: { label: "Confirmed", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
    packed: { label: "Ready/On the Way", icon: Truck, color: "text-purple-600 bg-purple-50" },
    collected: { label: "Delivered", icon: CheckCircle, color: "text-green-600 bg-green-50" },
}

export function DashboardClient({ orders, customer, addresses }: DashboardClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialTab = searchParams.get('tab') as "orders" | "wishlist" | "profile" || "orders"
    const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "profile">(initialTab)
    const [loading, setLoading] = useState(false)
    const [editingProfile, setEditingProfile] = useState(false)
    const [addingAddress, setAddingAddress] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
    const [loadingWishlist, setLoadingWishlist] = useState(false)
    const { wishlistItems, removeFromWishlist } = useWishlist()
    const { addItem } = useCart()

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: "/" })
    }

    const handleReorder = async (orderId: number) => {
        setLoading(true)
        const result = await reorderItems(orderId)

        if (result.success && result.items) {
            // Store items and order details in localStorage
            localStorage.setItem("reorder_items", JSON.stringify(result.items))
            localStorage.setItem("reorder_location", result.pickupLocation || "")
            localStorage.setItem("reorder_phone", result.phoneNumber || "")
            localStorage.setItem("reorder_location_id", result.pickupMtaaniLocation?.toString() || "")
            router.push("/cart?reorder=true")
        }
        setLoading(false)
    }

    const handleDeleteAccount = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true)
            return
        }

        setLoading(true)
        const result = await deleteCustomerAccount()

        if (result.success) {
            await signOut({ redirect: true, callbackUrl: "/" })
        }
        setLoading(false)
    }

    // Fetch wishlist products when wishlist tab is active
    useEffect(() => {
        if (activeTab === "wishlist" && wishlistItems.length > 0) {
            setLoadingWishlist(true)
            fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: wishlistItems })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.products) {
                        setWishlistProducts(data.products)
                    }
                })
                .catch(err => console.error('Failed to fetch wishlist:', err))
                .finally(() => setLoadingWishlist(false))
        }
    }, [activeTab, wishlistItems])

    const handleRemoveFromWishlist = (productId: number) => {
        removeFromWishlist(productId)
        setWishlistProducts(prev => prev.filter(p => p.id !== productId))
        toast.success("Removed from wishlist")
    }

    const handleAddToCartFromWishlist = (product: Product) => {
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images[0] || "",
        })
        toast.success(`${product.name} added to cart!`, {
            action: {
                label: "View Cart",
                onClick: () => router.push("/cart"),
            },
        })
    }

    const getDeliveryEstimate = (order: Order) => {
        if (order.status === "packed") {
            const packedTime = new Date(order.updated_at)
            const estimatedDelivery = new Date(packedTime)

            if (order.delivery_method === "pickup") {
                estimatedDelivery.setHours(18, 0, 0)
                return {
                    message: "Ready for pickup today",
                    time: estimatedDelivery.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                }
            } else {
                estimatedDelivery.setDate(estimatedDelivery.getDate() + 1)
                estimatedDelivery.setHours(14, 0, 0)
                return {
                    message: "Delivery expected",
                    time: estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                }
            }
        }
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                My Dashboard
                            </h1>
                            <p className="text-sm text-muted-foreground">Welcome back, {customer.name || "Gloss Babe"}!</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/">
                                <Button variant="outline" size="sm">
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Continue Shopping
                                </Button>
                            </Link>

                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Tabs - Orders, Wishlist, and Profile */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "orders"
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                            : "bg-white/60 text-muted-foreground hover:bg-white"
                            }`}
                    >
                        <Package className="w-4 h-4 inline mr-2" />
                        My Orders ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("wishlist")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "wishlist"
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                            : "bg-white/60 text-muted-foreground hover:bg-white"
                            }`}
                    >
                        <Heart className="w-4 h-4 inline mr-2" />
                        Wishlist ({wishlistItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "profile"
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                            : "bg-white/60 text-muted-foreground hover:bg-white"
                            }`}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        Profile & Addresses
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === "orders" && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                                <p className="text-muted-foreground mb-4">Start shopping to see your orders here!</p>
                                <Link href="/">
                                    <Button className="bg-gradient-to-r from-rose-500 to-pink-500">
                                        Browse Products
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            orders.map((order) => {
                                const status = statusConfig[order.status]
                                const StatusIcon = status.icon
                                const estimate = getDeliveryEstimate(order)

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <span className="font-mono font-semibold text-lg">#{order.reference_code}</span>
                                                    {order.secret_code && order.secret_code.trim() !== "" && (
                                                        <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                            ㊙️ SECRET
                                                        </span>
                                                    )}
                                                    {order.has_bundle && (
                                                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                            🎁 BUNDLE
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString("en-US", {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Delivery Estimate */}
                                        {estimate && (
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                                                <div className="flex items-center gap-2 text-purple-800">
                                                    <Truck className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{estimate.message}: {estimate.time}</span>
                                                </div>
                                                <p className="text-xs text-purple-600 mt-1">
                                                    {order.pickup_location || order.pickup_mtaani_location}
                                                </p>
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        <div className="space-y-2 mb-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    {item.image && (
                                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Qty: {item.quantity} × KES {item.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total</p>
                                                <p className="text-xl font-bold">KES {order.total_amount.toLocaleString()}</p>
                                            </div>
                                            <Button
                                                onClick={() => handleReorder(order.id)}
                                                disabled={loading}
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <RefreshCcw className="w-4 h-4" />
                                                        Reorder
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })
                        )}

                        {/* Recommendations */}
                        {orders.length > 0 && <RecommendationsSection />}
                    </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === "wishlist" && (
                    <div className="space-y-4">
                        {loadingWishlist ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white/60 rounded-xl h-64 animate-pulse" />
                                ))}
                            </div>
                        ) : wishlistItems.length === 0 ? (
                            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                                <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                                <p className="text-muted-foreground mb-4">Save products you love to buy them later!</p>
                                <Link href="/shop">
                                    <Button className="bg-gradient-to-r from-rose-500 to-pink-500">
                                        Browse Products
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {wishlistProducts.map((product) => (
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
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleAddToCartFromWishlist(product)}
                                                        size="sm"
                                                        className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 h-9"
                                                    >
                                                        <ShoppingBag className="w-4 h-4 mr-1" />
                                                        Add to Cart
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleRemoveFromWishlist(product.id)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-9"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="max-w-2xl">
                        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Profile Information</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingProfile(!editingProfile)}
                                >
                                    {editingProfile ? "Cancel" : "Edit"}
                                </Button>
                            </div>

                            {editingProfile ? (
                                <form
                                    action={async (formData) => {
                                        const result = await updateCustomerProfile(formData)
                                        if (result.success) {
                                            setEditingProfile(false)
                                            router.refresh()
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={customer.name || ""}
                                            required
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            defaultValue={customer.phone_number || ""}
                                            required
                                            className="mt-2"
                                        />
                                    </div>
                                    <Button type="submit" className="bg-gradient-to-r from-rose-500 to-pink-500">
                                        Save Changes
                                    </Button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{customer.name || "Not set"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{customer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{customer.phone_number || "Not set"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Member Since</p>
                                        <p className="font-medium">
                                            {new Date(customer.created_at).toLocaleDateString("en-US", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Addresses Tab */}
                        {activeTab === "profile" && (
                            <div className="max-w-2xl space-y-4">
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-start justify-between"
                                    >
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="font-medium">{address.location}</p>
                                                {address.phone_number && (
                                                    <p className="text-sm text-muted-foreground">{address.phone_number}</p>
                                                )}
                                                {address.is_default && (
                                                    <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={async () => {
                                                await deleteCustomerAddress(address.id)
                                                router.refresh()
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}

                                <form
                                    action={async (formData) => {
                                        const result = await addCustomerAddress(formData)
                                        if (result.success) {
                                            router.refresh()
                                        }
                                    }}
                                    className="bg-white/40 rounded-xl p-4 border border-white/20 space-y-4"
                                >
                                    <h3 className="font-semibold">Add New Address</h3>
                                    <div>
                                        <Label htmlFor="location">Delivery Location</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            placeholder="e.g., Westlands, Nairobi"
                                            required
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="0712345678"
                                            required
                                            className="mt-2"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="isDefault" name="isDefault" className="rounded" />
                                        <Label htmlFor="isDefault" className="cursor-pointer">
                                            Set as default address
                                        </Label>
                                    </div>
                                    <Button type="submit" className="bg-gradient-to-r from-rose-500 to-pink-500">
                                        Save Address
                                    </Button>
                                </form>

                                {/* Delete Account */}
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-red-900 mb-1">Delete Account</h3>
                                            <p className="text-sm text-red-800">
                                                This will permanently delete your account and all associated data. This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                    {deleteConfirm ? (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-red-900">Are you absolutely sure?</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDeleteAccount}
                                                    disabled={loading}
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete My Account"}
                                                </Button>
                                                <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}


                    </div>
                )}
            </div>
        </div>
    )
}
