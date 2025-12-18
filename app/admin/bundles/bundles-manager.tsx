"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Package, Check, Edit2, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createBundle, deleteBundle, toggleBundleStatus, updateBundle } from "./actions"

interface Product {
  id: number
  name: string
  price: number
  images: string[]
}

interface Bundle {
  id: number
  name: string
  description: string
  product_ids: number[]
  original_price: number
  bundle_price: number
  savings: number
  bundle_image?: string
  is_active: boolean
  created_at: string
}

const DEFAULT_BUNDLE_IMAGES = [
  "/cute summer fridays lip gloss key chain charm….jpg",
  "/i love the new charms.jpg",
  "/Keep your lippie with you wherever you go by….jpg",
  "/my pic.jpg",
  "/charms.jpg",
  "/gold-hair-claw-clip.jpg",
]

export function BundlesManager({
  initialBundles,
  products,
}: {
  initialBundles: Bundle[]
  products: Product[]
}) {
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles)
  const [showForm, setShowForm] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [bundleName, setBundleName] = useState("")
  const [description, setDescription] = useState("")
  const [bundlePrice, setBundlePrice] = useState("")
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [bundleImage, setBundleImage] = useState("")
  const [selectedDefaultImage, setSelectedDefaultImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const originalPrice = selectedProducts.reduce((sum, id) => {
    const product = products.find((p) => p.id === id)
    return sum + Number(product?.price || 0)
  }, 0)

  const savings = originalPrice - (Number.parseFloat(bundlePrice) || 0)
  const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0

  const resetForm = () => {
    setBundleName("")
    setDescription("")
    setBundlePrice("")
    setDiscountPercentage("")
    setBundleImage("")
    setSelectedDefaultImage("")
    setSelectedProducts([])
    setEditingBundle(null)
  }

  const handleEdit = (bundle: Bundle) => {
    setEditingBundle(bundle)
    setBundleName(bundle.name)
    setDescription(bundle.description)
    setSelectedProducts(bundle.product_ids)
    setBundlePrice(bundle.bundle_price.toString())
    setBundleImage(bundle.bundle_image || "")
    setSelectedDefaultImage(bundle.bundle_image || "")
    setShowForm(true)
  }

  const handleCreate = async () => {
    if (!bundleName || selectedProducts.length < 2 || !bundlePrice) return

    setIsSubmitting(true)

    const imageToUse = bundleImage || selectedDefaultImage || null

    if (editingBundle) {
      // Update existing bundle
      const result = await updateBundle(editingBundle.id, {
        name: bundleName,
        description,
        product_ids: selectedProducts,
        original_price: originalPrice,
        bundle_price: Number.parseFloat(bundlePrice),
        savings,
        bundle_image: imageToUse,
      })

      if (result.success && result.bundle) {
        setBundles(bundles.map((b) => (b.id === editingBundle.id ? result.bundle as unknown as Bundle : b)))
        setShowForm(false)
        resetForm()
      }
    } else {
      // Create new bundle
      const result = await createBundle({
        name: bundleName,
        description,
        product_ids: selectedProducts,
        original_price: originalPrice,
        bundle_price: Number.parseFloat(bundlePrice),
        savings,
        bundle_image: imageToUse,
      })

      if (result.success && result.bundle) {
        setBundles([result.bundle as unknown as Bundle, ...bundles])
        setShowForm(false)
        resetForm()
      }
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: number) => {
    const result = await deleteBundle(id)
    if (result.success) {
      setBundles(bundles.filter((b) => b.id !== id))
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    const result = await toggleBundleStatus(id, !isActive)
    if (result.success) {
      setBundles(bundles.map((b) => (b.id === id ? { ...b, is_active: !isActive } : b)))
    }
  }

  const toggleProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Bundle Button */}
      <Button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="gap-2">
        <Plus className="w-4 h-4" />
        Create Bundle Deal
      </Button>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{editingBundle ? "Edit Bundle Deal" : "New Bundle Deal"}</h3>
              {editingBundle && (
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4 mr-1" /> Cancel Edit
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Bundle Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Gloss & Clip Combo"
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="e.g. Get your favorite gloss + matching clip at a special price!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Image Selection */}
              <div className="space-y-3">
                <Label>Bundle Image</Label>

                {/* Default Image Selection */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Choose a default image:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {DEFAULT_BUNDLE_IMAGES.map((img) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => {
                          setSelectedDefaultImage(img)
                          setBundleImage("")
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedDefaultImage === img ? "border-primary ring-2 ring-primary" : "border-border"
                          }`}
                      >
                        <Image src={img} alt="Default bundle" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL Input */}
                <div>
                  <Label htmlFor="bundleImage">Or enter custom image URL:</Label>
                  <Input
                    id="bundleImage"
                    placeholder="e.g. /bundle-gloss-clip.jpg"
                    value={bundleImage}
                    onChange={(e) => {
                      setBundleImage(e.target.value)
                      if (e.target.value) setSelectedDefaultImage("")
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to use selected default image
                  </p>
                </div>

                {/* Image Preview */}
                {(bundleImage || selectedDefaultImage) && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={bundleImage || selectedDefaultImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-3 block">Select Products (min 2)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${selectedProducts.includes(product.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedProducts.includes(product.id)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                          }`}
                      >
                        {selectedProducts.includes(product.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">KES {product.price.toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedProducts.length >= 2 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between text-sm px-1">
                    <span className="text-muted-foreground">Original Total:</span>
                    <span className="line-through font-medium">KES {originalPrice.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount">Discount Amount (KES)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max={originalPrice}
                        placeholder="e.g. 200"
                        value={discountPercentage}
                        onChange={(e) => {
                          const discountAmount = Number(e.target.value) || 0
                          setDiscountPercentage(e.target.value)

                          // Calculate final price: Original - Discount Amount
                          const finalPrice = Math.max(0, originalPrice - discountAmount)
                          setBundlePrice(finalPrice.toString())
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Final Price (KES)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        placeholder="Auto-calculated"
                        value={bundlePrice}
                        onChange={(e) => {
                          const finalPrice = Number(e.target.value) || 0
                          setBundlePrice(e.target.value)

                          // Calculate discount amount: Original - Final
                          if (originalPrice > 0) {
                            const discountAmount = Math.max(0, originalPrice - finalPrice)
                            setDiscountPercentage(discountAmount.toString())
                          }
                        }}
                      />
                    </div>
                  </div>

                  {bundlePrice && Number(bundlePrice) > 0 && (
                    <div className="flex justify-between text-sm font-medium text-green-600 bg-green-50 p-2 rounded">
                      <span>Customer Saves:</span>
                      <span>KES {savings.toLocaleString()} ({savingsPercent}%)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCreate}
                  disabled={!bundleName || selectedProducts.length < 2 || !bundlePrice || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editingBundle ? "Update Bundle" : "Create Bundle"}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bundles List */}
      <div className="grid gap-4">
        {bundles.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No bundle deals yet</p>
            <p className="text-sm text-muted-foreground">Create your first combo to boost sales!</p>
          </div>
        ) : (
          bundles.map((bundle) => (
            <motion.div
              key={bundle.id}
              layout
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
            >
              {/* Bundle Image Thumbnail */}
              {bundle.bundle_image && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={bundle.bundle_image}
                    alt={bundle.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{bundle.name}</h3>
                  {!bundle.is_active && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{bundle.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="line-through text-muted-foreground">
                    KES {bundle.original_price.toLocaleString()}
                  </span>
                  <span className="font-semibold text-primary">KES {bundle.bundle_price.toLocaleString()}</span>
                  <span className="text-green-600 font-medium">Save KES {bundle.savings.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(bundle)}>
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </Button>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${bundle.id}`} className="text-sm text-muted-foreground">
                    Active
                  </Label>
                  <Switch
                    id={`active-${bundle.id}`}
                    checked={bundle.is_active}
                    onCheckedChange={() => handleToggleStatus(bundle.id, bundle.is_active)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(bundle.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

