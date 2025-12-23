"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, Package, Mail, Users, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notifyProductWaitlist, getProductWaitlistDetails } from "./actions"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type WaitlistProduct = {
    id: number
    name: string
    slug: string
    images: string[]
    price: number
    stock_quantity: number
    is_active: boolean
    waitlist_count: number
    pending_count: number
}

type WaitlistEntry = {
    id: number
    email: string
    customer_name: string | null
    customer_email: string | null
    created_at: string
    notified: boolean
}

export function WaitlistClient({ initialData }: { initialData: any[] }) {
    const [products, setProducts] = useState<WaitlistProduct[]>(initialData as WaitlistProduct[])
    const [selectedProduct, setSelectedProduct] = useState<WaitlistProduct | null>(null)
    const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [notifying, setNotifying] = useState<number | null>(null)

    const handleViewDetails = async (product: WaitlistProduct) => {
        setSelectedProduct(product)
        setLoading(true)
        const result = await getProductWaitlistDetails(product.id)
        if (result.success && result.entries) {
            setWaitlistEntries(result.entries as WaitlistEntry[])
        }
        setLoading(false)
    }

    const handleNotify = async (productId: number) => {
        setNotifying(productId)
        const result = await notifyProductWaitlist(productId)

        if (result.success) {
            const message = 'message' in result ? result.message : "Waitlist notified successfully!"
            toast.success(message)
            // Refresh the product data
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, pending_count: 0 } : p
            ))
            // Refresh entries if dialog is open
            if (selectedProduct?.id === productId) {
                const entriesResult = await getProductWaitlistDetails(productId)
                if (entriesResult.success && entriesResult.entries) {
                    setWaitlistEntries(entriesResult.entries as WaitlistEntry[])
                }
            }
        } else {
            const error = 'error' in result ? result.error : "Failed to notify waitlist"
            toast.error(error)
        }
        setNotifying(null)
    }

    const totalWaitlist = products.reduce((sum, p) => sum + Number(p.waitlist_count), 0)
    const totalPending = products.reduce((sum, p) => sum + Number(p.pending_count), 0)

    return (
        <div className="p-4 sm:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Product Waitlists</h1>
                <p className="text-muted-foreground">Manage customer waitlist notifications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Products with Waitlists</p>
                            <p className="text-2xl font-bold">{products.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Customers</p>
                            <p className="text-2xl font-bold">{totalWaitlist}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Bell className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending Notifications</p>
                            <p className="text-2xl font-bold">{totalPending}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products List */}
            {products.length === 0 ? (
                <div className="bg-card border rounded-lg p-12 text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No waitlists yet</h3>
                    <p className="text-muted-foreground">Customers haven't joined any waitlists</p>
                </div>
            ) : (
                <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-semibold">Product</th>
                                    <th className="text-left p-4 font-semibold">Stock</th>
                                    <th className="text-left p-4 font-semibold">Waitlist Count</th>
                                    <th className="text-left p-4 font-semibold">Pending</th>
                                    <th className="text-right p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                    {product.images[0] ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-muted-foreground m-auto" />
                                                    )}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        className="font-medium hover:text-primary transition-colors"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground">
                                                        KES {product.price.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${product.stock_quantity > 0
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}>
                                                {product.stock_quantity > 0 ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3" />
                                                        In Stock ({product.stock_quantity})
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-3 h-3" />
                                                        Out of Stock
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleViewDetails(product)}
                                                className="text-primary hover:underline font-medium"
                                            >
                                                {product.waitlist_count} {Number(product.waitlist_count) === 1 ? "customer" : "customers"}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            {Number(product.pending_count) > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                    <Bell className="w-3 h-3" />
                                                    {product.pending_count} pending
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">All notified</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                onClick={() => handleNotify(product.id)}
                                                disabled={notifying === product.id || Number(product.pending_count) === 0}
                                                size="sm"
                                                className="gap-2"
                                            >
                                                {notifying === product.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Notifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail className="w-4 h-4" />
                                                        Notify All
                                                    </>
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Details Dialog */}
            <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Waitlist Details: {selectedProduct?.name}</DialogTitle>
                        <DialogDescription>
                            {waitlistEntries.length} {waitlistEntries.length === 1 ? "customer" : "customers"} on waitlist
                        </DialogDescription>
                    </DialogHeader>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {waitlistEntries.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {entry.customer_name || entry.customer_email || entry.email}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Joined {new Date(entry.created_at).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    {entry.notified && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            <Mail className="w-3 h-3" />
                                            Notified
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
