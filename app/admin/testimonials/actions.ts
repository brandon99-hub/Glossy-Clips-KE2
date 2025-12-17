"use server"

import { sql } from "@/lib/db"

export async function addTestimonial(formData: FormData) {
  const username = formData.get("username") as string
  const profile_image = formData.get("profile_image") as string
  const message = formData.get("message") as string
  const emoji_reactions = formData.get("emoji_reactions") as string

  try {
    await sql`
      INSERT INTO testimonials (username, profile_image, message, emoji_reactions)
      VALUES (${username.replace("@", "")}, ${profile_image || "/placeholder.svg?height=60&width=60"}, ${message}, ${emoji_reactions})
    `
    return { success: true }
  } catch (error) {
    console.error("Error adding testimonial:", error)
    return { success: false }
  }
}

export async function deleteTestimonial(id: number) {
  try {
    await sql`DELETE FROM testimonials WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return { success: false }
  }
}
