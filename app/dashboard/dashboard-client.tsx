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
            <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-20">
                <div className="container mx-auto px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-center sm:text-left">
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                My Dashboard
                            </h1>
                            <p className="text-[10px] sm:text-sm text-muted-foreground">Welcome back, {customer.name || "Gloss Babe"}!</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Link href="/" className="w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="w-full text-xs h-9">
                                    <ShoppingBag className="w-3.5 h-3.5 mr-2" />
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 sm:py-8">
                {/* Tabs - Orders, Wishlist, and Profile */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide sticky top-[72px] sm:top-[88px] bg-gradient-to-br from-rose-50/90 via-pink-50/90 to-white/90 backdrop-blur-md z-10 sm:relative sm:top-0 sm:bg-transparent sm:backdrop-blur-none sm:pb-2">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex items-center justify-center px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 shadow-sm border border-white/40 ${activeTab === "orders"
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent"
                            : "bg-white/60 text-muted-foreground hover:bg-white"
                            }`}
                    >
                        <Package className="w-4 h-4 mr-2" />
                        My Orders ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("wishlist")}
                        className={`flex items-center justify-center px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 shadow-sm border border-white/40 ${activeTab === "wishlist"
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent"
                            : "bg-white/60 text-muted-foreground hover:bg-white"
                            }`}
                    >
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist ({wishlistItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center justify-center px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 shadow-sm border border-white/40 ${activeTab === "profile"
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent"
                            : "bg-white/60 text-muted-foreground hover:bg-white"
                            }`}
                    >
                        <User className="w-4 h-4 mr-2" />
                        Profile
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
                                        className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                                            <div className="w-full sm:w-auto">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-mono font-bold text-base sm:text-lg">#{order.reference_code}</span>
                                                    {order.secret_code && order.secret_code.trim() !== "" && (
                                                        <span className="bg-rose-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                                                            ㊙️ SECRET
                                                        </span>
                                                    )}
                                                    {order.has_bundle && (
                                                        <span className="bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                                                            🎁 BUNDLE
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                                    {new Date(order.created_at).toLocaleDateString("en-US", {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full overflow-hidden shadow-sm ${status.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Delivery Estimate */}
                                        {estimate && (
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 mb-6 shadow-sm">
                                                <div className="flex items-center gap-3 text-purple-800">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        <Truck className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold">{estimate.message}: {estimate.time}</span>
                                                        <p className="text-[10px] text-purple-600 font-medium uppercase tracking-tight mt-0.5">
                                                            {order.pickup_location || order.pickup_mtaani_location}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        <div className="space-y-3 mb-6 bg-white/40 rounded-xl p-3 sm:p-0 sm:bg-transparent">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 sm:hidden px-1">Items</p>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 group">
                                                    {item.image ? (
                                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-white/60 shadow-sm transition-transform group-hover:scale-105">
                                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center border border-white/60 shadow-sm">
                                                            <Package className="w-6 h-6 text-muted-foreground/40" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm truncate text-gray-800">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground font-medium">
                                                            Qty: {item.quantity} × KES {item.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-white/40">
                                            <div className="flex items-center justify-between sm:block">
                                                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Amount</p>
                                                <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                                    KES {order.total_amount.toLocaleString()}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => handleReorder(order.id)}
                                                disabled={loading}
                                                variant="outline"
                                                className="w-full sm:w-auto gap-2 h-11 sm:h-auto rounded-xl font-bold transition-all hover:bg-white active:scale-95 shadow-sm border-white/60"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <RefreshCcw className="w-4 h-4 text-rose-500" />
                                                        REORDER ITEMS
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
                    <div className="space-y-6">
                        {loadingWishlist ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white/40 rounded-2xl h-64 sm:h-80 animate-pulse border border-white/20" />
                                ))}
                            </div>
                        ) : wishlistItems.length === 0 ? (
                            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                                <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                                <p className="text-muted-foreground mb-4">Save products you love to buy them later!</p>
                                <Link href="/shop">
                                    <Button className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl h-12 px-8 font-bold shadow-lg shadow-rose-200">
                                        Browse Products
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {wishlistProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white/60 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:shadow-xl transition-all group flex flex-col"
                                    >
                                        <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-muted overflow-hidden">
                                            {product.images[0] && (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent h-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                        <div className="p-3 sm:p-4 flex-1 flex flex-col">
                                            <Link href={`/product/${product.slug}`} className="block mb-2 flex-1">
                                                <h3 className="font-bold text-xs sm:text-base line-clamp-2 hover:text-rose-600 transition-colors leading-tight">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                            <div className="mb-4">
                                                <p className="text-sm sm:text-xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                                    KES {product.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleAddToCartFromWishlist(product)}
                                                    size="sm"
                                                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 h-9 sm:h-11 rounded-xl font-bold shadow-sm active:scale-95 text-[10px] sm:text-xs"
                                                >
                                                    <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                                                    ADD
                                                </Button>
                                                <Button
                                                    onClick={() => handleRemoveFromWishlist(product.id)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 sm:h-11 w-9 sm:w-11 rounded-xl p-0 border-white/60 hover:bg-white active:scale-95 text-muted-foreground hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Profile Details
                                    </h2>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Personal Info</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingProfile(!editingProfile)}
                                    className="rounded-xl border-white/60 shadow-sm bg-white/40 font-bold"
                                >
                                    {editingProfile ? "Cancel" : "Edit Info"}
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
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={customer.name || ""}
                                            required
                                            className="h-12 rounded-xl bg-white/40 border-white/60 shadow-sm focus:ring-rose-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            defaultValue={customer.phone_number || ""}
                                            required
                                            className="h-12 rounded-xl bg-white/40 border-white/60 shadow-sm focus:ring-rose-500"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 font-bold shadow-lg shadow-rose-100 transition-all active:scale-95">
                                        SAVE CHANGES
                                    </Button>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                                        <p className="font-bold text-gray-800 text-base">{customer.name || "Not set"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                                        <p className="font-bold text-gray-800 text-base truncate">{customer.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone Number</p>
                                        <p className="font-bold text-gray-800 text-base">{customer.phone_number || "Not set"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Member Since</p>
                                        <p className="font-bold text-gray-800 text-base">
                                            {new Date(customer.created_at).toLocaleDateString("en-US", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Addresses Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Saved Addresses
                                </h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-white/20">
                                    {addresses.length} SAVED
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 sm:p-5 border border-white/40 flex items-center justify-between group hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="p-3 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                                                <MapPin className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-800 truncate">{address.location}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {address.phone_number && (
                                                        <p className="text-xs text-muted-foreground font-medium">{address.phone_number}</p>
                                                    )}
                                                    {address.is_default && (
                                                        <span className="text-[9px] bg-green-100 text-green-700 font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-green-200">
                                                            DEFAULT
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={async () => {
                                                await deleteCustomerAddress(address.id)
                                                router.refresh()
                                            }}
                                            className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/40 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-100">
                                        <Plus className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="font-black text-gray-800">Add New Address</h3>
                                </div>

                                <form
                                    action={async (formData) => {
                                        const result = await addCustomerAddress(formData)
                                        if (result.success) {
                                            router.refresh()
                                        }
                                    }}
                                    className="space-y-5"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Delivery Location</Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                placeholder="e.g. Westlands, Nairobi"
                                                required
                                                className="h-12 rounded-xl bg-white/40 border-white/60 shadow-sm focus:ring-rose-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Alternative Phone</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="0712345678"
                                                required
                                                className="h-12 rounded-xl bg-white/40 border-white/60 shadow-sm focus:ring-rose-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 px-1">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            name="isDefault"
                                            className="w-5 h-5 rounded-md border-white/60 bg-white/40 text-rose-500 focus:ring-rose-500 cursor-pointer"
                                        />
                                        <Label htmlFor="isDefault" className="text-sm font-bold text-gray-600 cursor-pointer">
                                            Set as my primary delivery address
                                        </Label>
                                    </div>

                                    <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white font-bold shadow-lg transition-all active:scale-95 group">
                                        ADD DELIVERY ADDRESS
                                        <Plus className="w-4 h-4 ml-2 group-hover:rotate-90 transition-transform" />
                                    </Button>
                                </form>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-3xl p-6 sm:p-8 mt-12 flex flex-col sm:flex-row items-center gap-6">
                                <div className="p-4 bg-red-100 rounded-2xl flex-shrink-0">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-black text-red-900 mb-1 uppercase tracking-tight">Danger Zone</h3>
                                    <p className="text-sm text-red-800/80 font-medium">
                                        Deleting your account is permanent and cannot be undone. All your orders and data will be erased.
                                    </p>
                                </div>
                                <div className="w-full sm:w-auto">
                                    {deleteConfirm ? (
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="destructive"
                                                onClick={handleDeleteAccount}
                                                disabled={loading}
                                                className="rounded-xl font-bold h-12 px-6 animate-pulse"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "YES, DELETE PERMANENTLY"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setDeleteConfirm(false)} className="rounded-xl font-bold border-red-200">
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            onClick={() => setDeleteConfirm(true)}
                                            className="w-full sm:w-auto h-12 rounded-xl font-bold px-8 shadow-lg shadow-red-100 transition-all active:scale-95"
                                        >
                                            DELETE ACCOUNT
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
