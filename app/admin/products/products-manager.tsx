"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2, Package, Tag, Layers, FileImage, Check, X, Loader2 } from "lucide-react"
import type { Product, Category } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { createProduct, updateProduct, deleteProduct, toggleProductStatus } from "./actions"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductsManager({ products: initialProducts, categories }: { products: Product[]; categories: Category[] }) {
    const [products, setProducts] = useState(initialProducts)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category: "",
        images: [] as string[],
        is_active: true
    })

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            stock_quantity: "",
            category: "",
            images: [],
            is_active: true
        })
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
            is_active: product.is_active
        })
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

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return
        const res = await deleteProduct(id)
        if (res.success) {
            toast.success("Product deleted")
            setProducts(products.filter(p => p.id !== id))
        } else {
            toast.error("Failed to delete")
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (showForm) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{editingProduct ? "Edit Product" : "New Product"}</h2>
                    <Button variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-[2fr_1fr] gap-8">
                        {/* Left Column: Details */}
                        <div className="space-y-6">
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

                                <div className="grid grid-cols-3 gap-2">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                                            <Image src={img} alt="Product" fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                                        <div className="text-center p-2">
                                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <Plus className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />}
                                            <span className="text-xs text-muted-foreground">Add Image</span>
                                        </div>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={loading} />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground">First image will be the cover.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="min-w-[120px]">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-muted-foreground">{products.length} items in inventory</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
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
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                                    <Pencil className="w-3 h-3 mr-2" /> Edit
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(product.id)}>
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
        </div>
    )
}
