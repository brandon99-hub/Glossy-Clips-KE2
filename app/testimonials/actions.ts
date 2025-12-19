"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function submitTestimonial(formData: FormData) {
    try {
        const username = formData.get("username") as string
        const message = formData.get("message") as string

        // Use default profile image
        const imageUrl = "/placeholder.svg?height=60&width=60"

        // Insert testimonial (inactive by default, requires admin approval)
        await sql`
      INSERT INTO testimonials (username, profile_image, message, is_active, is_approved)
      VALUES (${username}, ${imageUrl}, ${message}, true, false)
    `

        revalidatePath("/testimonials")
        revalidatePath("/admin/testimonials")

        return { success: true }
    } catch (error) {
        console.error("Error submitting testimonial:", error)
        return { success: false, error: "Failed to submit testimonial" }
    }
}
