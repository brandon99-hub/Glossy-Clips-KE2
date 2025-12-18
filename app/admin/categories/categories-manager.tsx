"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2, GripVertical, Tag, Check, X, Loader2, AlertTriangle, FileImage } from "lucide-react"
import type { Category } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
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
import { createCategory, updateCategory, deleteCategory } from "./actions"
import { toast } from "sonner"

const DEFAULT_CATEGORY_IMAGES = [
    "/gold-hair-claw-clip.jpg",
    "/summer-fridays-vanilla-lip-gloss-pink-tube.jpg",
    "/charms.jpg",
    "/my pic.jpg",
    "/cute summer fridays lip gloss key chain charm….jpg",
    "/i love the new charms.jpg",
]

export function CategoriesManager({ categories: initialCategories }: { categories: Category[] }) {
    const [categories, setCategories] = useState(initialCategories)
    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null)
    const [selectedDefaultImage, setSelectedDefaultImage] = useState("")

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image: "",
        is_active: true
    })

    const resetForm = () => {
        setFormData({
            name: "",
            slug: "",
            description: "",
            image: "",
            is_active: true
        })
        setSelectedDefaultImage("")
        setEditingCategory(null)
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            image: category.image || "",
            is_active: category.is_active
        })
        setSelectedDefaultImage(category.image || "")
        setShowForm(true)
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            slug: editingCategory ? prev.slug : generateSlug(name)
        }))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        const data = new FormData()
        data.append("file", file)

        try {
            const res = await fetch("/api/upload", { method: "POST", body: data })
            const json = await res.json()
            if (json.success) {
                setFormData(prev => ({ ...prev, image: json.url }))
                toast.success("Image uploaded")
            } else {
                toast.error("Failed to upload image")
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to upload image")
        }
        setLoading(false)
    }

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: "" }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const form = new FormData()
        const imageToUse = formData.image || selectedDefaultImage
        form.append("name", formData.name)
        form.append("slug", formData.slug)
        form.append("description", formData.description)
        form.append("image", imageToUse)
        if (formData.is_active) form.append("is_active", "on")

        let result
        if (editingCategory) {
            form.append("id", editingCategory.id.toString())
            result = await updateCategory(form)
        } else {
            result = await createCategory(form)
        }

        if (result.success) {
            toast.success(editingCategory ? "Category updated" : "Category created")
            setShowForm(false)
            resetForm()
            window.location.reload()
        } else {
            toast.error(result.error || "Something went wrong")
        }
        setLoading(false)
    }

    const openDeleteModal = (id: number, name: string) => {
        setCategoryToDelete({ id, name })
        setDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!categoryToDelete) return

        const res = await deleteCategory(categoryToDelete.id)
        if (res.success) {
            toast.success("Category deleted")
            setCategories(categories.filter(c => c.id !== categoryToDelete.id))
        } else {
            toast.error(res.error || "Failed to delete")
        }

        setDeleteModalOpen(false)
        setCategoryToDelete(null)
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (showForm) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{editingCategory ? "Edit Category" : "New Category"}</h2>
                    <Button variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Tag className="w-4 h-4" /> Category Details</h3>

                        <div>
                            <Label>Category Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={e => handleNameChange(e.target.value)}
                                required
                                placeholder="e.g. Hair Charms"
                            />
                        </div>

                        <div>
                            <Label>Slug *</Label>
                            <Input
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                required
                                placeholder="hair-charm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Used in URLs. Auto-generated from name.
                            </p>
                        </div>

                        <div>
                            <Label>Description (Optional)</Label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Describe this category..."
                            />
                        </div>

                        <div>
                            <Label>Category Image</Label>

                            {/* Default Image Selection */}
                            <div className="mt-2 space-y-3">
                                <p className="text-sm text-muted-foreground">Choose a default image:</p>
                                <div className="grid grid-cols-4 gap-3">
                                    {DEFAULT_CATEGORY_IMAGES.map((img) => (
                                        <button
                                            key={img}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDefaultImage(img)
                                                setFormData({ ...formData, image: "" })
                                            }}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedDefaultImage === img && !formData.image
                                                ? "border-primary ring-2 ring-primary"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                        >
                                            <Image src={img} alt="Default category" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom URL Input */}
                            <div className="mt-3">
                                <Label htmlFor="customImage">Or upload custom image:</Label>
                                <div className="flex gap-2 mt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={loading}
                                        onClick={() => document.getElementById('category-image-upload')?.click()}
                                        className="flex-1"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <FileImage className="w-4 h-4 mr-2" />
                                                Upload Image
                                            </>
                                        )}
                                    </Button>
                                    <input
                                        id="category-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Image Preview */}
                            {(formData.image || selectedDefaultImage) && (
                                <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden border border-border">
                                    <Image
                                        src={formData.image || selectedDefaultImage}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    {formData.image && (
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground mt-2">
                                Recommended: 800x400px (16:9 ratio)
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <Label className="text-base">Active Status</Label>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={c => setFormData({ ...formData, is_active: c })}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Inactive categories are hidden from the store.</p>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="min-w-[120px]">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingCategory ? "Save Changes" : "Create Category"}
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
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">{categories.length} categories</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-6 bg-card p-2 rounded-lg border border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                    className="border-none shadow-none focus-visible:ring-0"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                {filteredCategories.map(category => (
                    <div
                        key={category.id}
                        className={`bg-card border rounded-xl p-4 transition-all hover:shadow-md ${!category.is_active ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />

                            {/* Category Image Thumbnail */}
                            {category.image && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{category.name}</h3>
                                    {!category.is_active && (
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">/{category.slug}</p>
                                {category.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                                    <Pencil className="w-3 h-3 mr-2" /> Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openDeleteModal(category.id, category.name)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No categories found matching "{searchTerm}"
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{categoryToDelete?.name}"?
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone. If products are using this category, deletion will be prevented.
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete Category
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
