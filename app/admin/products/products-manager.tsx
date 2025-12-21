"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2, Package, Tag, Layers, FileImage, Check, X, Loader2 } from "lucide-react"
import type { Product, Category } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"
import { createProduct, updateProduct, deleteProduct, toggleProductStatus } from "./actions"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DEFAULT_PRODUCT_IMAGES = [
    "/gold-hair-claw-clip.jpg",
    "/summer-fridays-vanilla-lip-gloss-pink-tube.jpg",
    "/charms.jpg",
    "/my pic.jpg",
    "/cute summer fridays lip gloss key chain charm….jpg",
    "/i love the new charms.jpg",
    "/Keep your lippie with you wherever you go by….jpg",
    "/pearl-hair-pins-set.jpg",
    "/colorful-butterfly-hair-clips.jpg",
    "/summer-fridays-cherry-lip-gloss.jpg",
    "/satin-scrunchies-pink-brown-beige.jpg",
]

export function ProductsManager({ products: initialProducts, categories }: { products: Product[]; categories: Category[] }) {
    const [products, setProducts] = useState(initialProducts)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDefaultImage, setSelectedDefaultImage] = useState("")
    const [deleteProductId, setDeleteProductId] = useState<number | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category: "",
        images: [] as string[],
        is_active: true,
        is_secret: false
    })

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            stock_quantity: "",
            category: "",
            images: [],
            is_active: true,
            is_secret: false
        })
        setSelectedDefaultImage("")
        setEditingProduct(null)
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock_quantity: (product.stock_quantity || 0).toString(),
            category: product.category,
            images: product.images,
            is_active: product.is_active,
            is_secret: product.is_secret || false
        })
        setSelectedDefaultImage("")
        setShowForm(true)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setLoading(true)
        const newImages = [...formData.images]

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const data = new FormData()
            data.append("file", file)

            try {
                const res = await fetch("/api/upload", { method: "POST", body: data })
                const json = await res.json()
                if (json.success) {
                    newImages.push(json.url)
                }
            } catch (err) {
                console.error(err)
                toast.error("Failed to upload image")
            }
        }

        setFormData(prev => ({ ...prev, images: newImages }))
        setLoading(false)
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const form = new FormData()
        form.append("name", formData.name)
        form.append("description", formData.description)
        form.append("price", formData.price)
        form.append("stock_quantity", formData.stock_quantity)
        form.append("category", formData.category)
        form.append("images", formData.images.join(",")) // Send as comma-separated string, handled in action
        if (formData.is_active) form.append("is_active", "on")
        if (formData.is_secret) form.append("is_secret", "on")

        let result
        if (editingProduct) {
            form.append("id", editingProduct.id.toString())
            result = await updateProduct(form)
        } else {
            result = await createProduct(form)
        }

        if (result.success) {
            toast.success(editingProduct ? "Product updated" : "Product created")
            setShowForm(false)
            resetForm()
            // Ideally verify with router.refresh() in parent or use optimistic updates, 
            // but for now relying on server action revalidatePath which might need a manual refresh on client sometimes
            window.location.reload()
        } else {
            toast.error(result.error || "Something went wrong")
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!deleteProductId) return
        const res = await deleteProduct(deleteProductId)
        if (res.success) {
            toast.success("Product deleted")
            setProducts(products.filter(p => p.id !== deleteProductId))
        } else {
            toast.error("Failed to delete")
        }
        setDeleteProductId(null)
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (showForm) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold">{editingProduct ? "Edit Product" : "New Product"}</h2>
                    <Button variant="ghost" onClick={() => { setShowForm(false); resetForm(); }} className="min-h-[44px]">Cancel</Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    <div className="grid gap-6 sm:gap-8 lg:grid-cols-[2fr_1fr]">
                        {/* Left Column: Details */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                                <h3 className="font-semibold flex items-center gap-2"><Tag className="w-4 h-4" /> Basic Info</h3>
                                <div>
                                    <Label>Product Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Midnight Sparkle Lip Gloss"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        rows={5}
                                        placeholder="Describe your product..."
                                    />
                                </div>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                                <h3 className="font-semibold flex items-center gap-2"><Package className="w-4 h-4" /> Inventory & Pricing</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Price (KES)</Label>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <Label>Stock Quantity</Label>
                                        <Input
                                            type="number"
                                            value={formData.stock_quantity}
                                            onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Organization & Images */}
                        <div className="space-y-6">
                            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Active Status</Label>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={c => setFormData({ ...formData, is_active: c })}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Inactive products are hidden from the store.</p>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">🔒 Secret Product</Label>
                                    <Switch
                                        checked={formData.is_secret}
                                        onCheckedChange={c => setFormData({ ...formData, is_secret: c })}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Secret products are only visible via QR code and get automatic discount.</p>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                                <h3 className="font-semibold flex items-center gap-2"><Layers className="w-4 h-4" /> Category</h3>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.slug}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                                <h3 className="font-semibold flex items-center gap-2"><FileImage className="w-4 h-4" /> Media</h3>

                                {/* Default Image Selection */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Choose from default images:</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                        {DEFAULT_PRODUCT_IMAGES.map((img) => (
                                            <button
                                                key={img}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDefaultImage(img)
                                                    setFormData({ ...formData, images: [...formData.images, img] })
                                                }}
                                                className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary/50 active:scale-95"
                                            >
                                                <Image src={img} alt="Default product" fill className="object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Images */}
                                <div>
                                    <p className="text-sm font-medium mb-2">Selected images:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                                                <Image src={img} alt="Product" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors active:scale-95"
                                                    style={{ minWidth: '28px', minHeight: '28px' }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer active:scale-95">
                                            <div className="text-center p-2">
                                                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <Plus className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />}
                                                <span className="text-xs text-muted-foreground">Upload</span>
                                            </div>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={loading} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">First image will be the cover.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t sticky bottom-0 bg-background pb-safe-area-pb">
                        <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="min-h-[44px]">Cancel</Button>
                        <Button type="submit" disabled={loading} className="min-w-[120px] min-h-[44px]">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingProduct ? "Save Changes" : "Create Product"}
                        </Button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
                    <p className="text-sm text-muted-foreground">{products.length} items in inventory</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto min-h-[44px]">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-6 bg-card p-2 rounded-lg border border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                    className="border-none shadow-none focus-visible:ring-0"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className={`bg-card group border rounded-xl overflow-hidden transition-all hover:shadow-md ${!product.is_active ? 'opacity-60 grayscale' : ''}`}>
                        <div className="relative aspect-[4/3] bg-muted">
                            {product.images[0] ? (
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <FileImage className="w-8 h-8 opacity-20" />
                                </div>
                            )}
                            {!product.is_active && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">Inactive</span>
                                </div>
                            )}
                            {product.is_secret && (
                                <div className="absolute top-2 right-2">
                                    <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        🔒 SECRET
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <h3 className="font-semibold truncate">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground">{product.category}</p>
                                </div>
                                <p className="font-bold text-primary">KSh {product.price}</p>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Package className="w-3 h-3" />
                                <span>{product.stock_quantity} in stock</span>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t">
                                <Button variant="outline" size="sm" className="flex-1 min-h-[44px]" onClick={() => handleEdit(product)}>
                                    <Pencil className="w-3 h-3 mr-2" /> Edit
                                </Button>
                                <Button variant="destructive" size="icon" className="min-w-[44px] min-h-[44px]" onClick={() => setDeleteProductId(product.id)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No products found matching "{searchTerm}"
                </div>
            )}

            <AlertDialog open={deleteProductId !== null} onOpenChange={(open) => !open && setDeleteProductId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this product
                            from your inventory and remove it from the store.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Product
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
