"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Package, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createBundle, deleteBundle, toggleBundleStatus } from "./actions"

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
  is_active: boolean
  created_at: string
}

export function BundlesManager({
  initialBundles,
  products,
}: {
  initialBundles: Bundle[]
  products: Product[]
}) {
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles)
  const [showForm, setShowForm] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [bundleName, setBundleName] = useState("")
  const [description, setDescription] = useState("")
  const [bundlePrice, setBundlePrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const originalPrice = selectedProducts.reduce((sum, id) => {
    const product = products.find((p) => p.id === id)
    return sum + (product?.price || 0)
  }, 0)

  const savings = originalPrice - (Number.parseFloat(bundlePrice) || 0)

  const handleCreate = async () => {
    if (!bundleName || selectedProducts.length < 2 || !bundlePrice) return

    setIsSubmitting(true)
    const result = await createBundle({
      name: bundleName,
      description,
      product_ids: selectedProducts,
      original_price: originalPrice,
      bundle_price: Number.parseFloat(bundlePrice),
      savings,
    })

    if (result.success && result.bundle) {
      setBundles([result.bundle, ...bundles])
      setShowForm(false)
      setBundleName("")
      setDescription("")
      setBundlePrice("")
      setSelectedProducts([])
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
      <Button onClick={() => setShowForm(!showForm)} className="gap-2">
        <Plus className="w-4 h-4" />
        Create Bundle Deal
      </Button>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-xl p-6 overflow-hidden"
          >
            <h3 className="font-semibold mb-4">New Bundle Deal</h3>

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

              <div>
                <Label className="mb-3 block">Select Products (min 2)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                        selectedProducts.includes(product.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedProducts.includes(product.id)
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
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original Total:</span>
                    <span className="line-through">KES {originalPrice.toLocaleString()}</span>
                  </div>

                  <div>
                    <Label htmlFor="price">Bundle Price (KES)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder={`e.g. ${Math.round(originalPrice * 0.85)}`}
                      value={bundlePrice}
                      onChange={(e) => setBundlePrice(e.target.value)}
                    />
                  </div>

                  {bundlePrice && (
                    <div className="flex justify-between text-sm font-medium text-green-600">
                      <span>Customer Saves:</span>
                      <span>KES {savings.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCreate}
                  disabled={!bundleName || selectedProducts.length < 2 || !bundlePrice || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Bundle"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
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
