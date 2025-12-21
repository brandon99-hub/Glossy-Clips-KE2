"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Trash2, Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Testimonial } from "@/lib/db"
import { addTestimonial, deleteTestimonial, updateTestimonial, toggleApproval } from "./actions"

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    if (editingTestimonial) {
      formData.append("id", editingTestimonial.id.toString())
      await updateTestimonial(formData)
    } else {
      await addTestimonial(formData)
    }

    setShowForm(false)
    setLoading(false)
    setImageUrl("")
    setEditingTestimonial(null)
    router.refresh()
  }

  const handleEdit = (t: Testimonial) => {
    setEditingTestimonial(t)
    setImageUrl(t.profile_image)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTestimonial(null)
    setImageUrl("")
  }

  const handleDelete = async (id: number) => {
    setDeleting(id)
    await deleteTestimonial(id)
    router.refresh()
    setDeleting(null)
  }

  return (
    <div>
      {/* Add button */}
      {/* Add button */}
      <Button onClick={() => {
        setEditingTestimonial(null)
        setImageUrl("")
        setShowForm(!showForm)
      }} className="mb-6 bg-primary hover:bg-primary/90">
        <Plus className="w-4 h-4 mr-2" /> {showForm ? "Close Form" : "Add Testimonial"}
      </Button>

      {/* Add form */}
      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="@username"
                required
                className="mt-1"
                defaultValue={editingTestimonial?.username || ""}
              />
            </div>
            <div>
              <Label htmlFor="profile_image">Profile Image</Label>
              <div className="flex gap-2 mt-1">
                <Input id="profile_image" name="profile_image" type="hidden" value={imageUrl} />
                <Input
                  type="file"
                  accept="image/*"
                  className="text-xs sm:text-sm"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    const formData = new FormData()
                    formData.append("file", file)

                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    })

                    const data = await res.json()
                    if (data.success) {
                      setImageUrl(data.url)
                    }
                  }}
                />
              </div>
              {imageUrl && (
                <div className="mt-2 relative w-12 h-12 rounded-full overflow-hidden border">
                  <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="What they said..."
              required
              className="mt-1"
              rows={3}
              defaultValue={editingTestimonial?.message || ""}
            />
          </div>

          <div>
            <Label htmlFor="emoji_reactions">Emoji Reactions (comma-separated)</Label>
            <Input
              id="emoji_reactions"
              name="emoji_reactions"
              placeholder="fire,heart,sparkles"
              className="mt-1"
              defaultValue={editingTestimonial?.emoji_reactions || ""}
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Available: fire, heart, sparkles, crying, gift, laughing, hundred, skull, money, heart_eyes
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingTestimonial ? "Update" : "Add")}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none bg-transparent hover:bg-muted">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Testimonials list */}
      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex items-start gap-3 w-full">
                <div className="flex-shrink-0">
                  <Image
                    src={t.profile_image || "/pfp.jpg"}
                    alt={t.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-border"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">@{t.username}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {t.is_approved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{t.message}</p>
                  {t.emoji_reactions && (
                    <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-1.5 rounded inline-block">Reactions: {t.emoji_reactions}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                <button
                  onClick={async () => {
                    await toggleApproval(t.id, t.is_approved)
                    router.refresh()
                  }}
                  className={`flex-1 sm:w-24 px-3 py-2 text-xs font-medium rounded-md transition-colors text-center ${t.is_approved ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {t.is_approved ? 'Unapprove' : 'Approve'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(t)}
                    disabled={deleting === t.id}
                    className="flex-1 sm:flex-none p-2 rounded-md border border-border text-muted-foreground hover:text-primary hover:bg-muted transition-colors flex justify-center items-center h-9 w-9 sm:w-full"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="flex-1 sm:flex-none p-2 rounded-md border border-border text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors flex justify-center items-center h-9 w-9 sm:w-full"
                    title="Delete"
                  >
                    {deleting === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No testimonials yet</div>
        )}
      </div>
    </div>
  )
}
