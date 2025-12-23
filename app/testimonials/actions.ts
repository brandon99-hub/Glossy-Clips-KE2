"use server"

import { sql } from "@/lib/db"
import { auth } from "@/lib/auth-helper"
import { revalidatePath } from "next/cache"

export async function submitTestimonial(formData: FormData) {
    try {
        const session = await auth()

        // Require authentication
        if (!session?.user?.id) {
            return { success: false, error: "Please login to leave a testimonial" }
        }

        const message = formData.get("message") as string

        // Verify customer has made at least one purchase
        const orders = await sql`
      SELECT COUNT(*) as count FROM orders
      WHERE customer_id = ${parseInt(session.user.id)}
      AND status IN ('paid', 'packed', 'collected')
    `

        if (orders[0].count === 0) {
            return { success: false, error: "Only verified customers who have made a purchase can leave testimonials" }
        }

        // Get customer info
        const customers = await sql`
      SELECT name, email FROM customers
      WHERE id = ${parseInt(session.user.id)}
    `

        const customer = customers[0]
        const username = customer.name || customer.email.split('@')[0]

        // Randomly select from available avatar images
        const avatarImages = [
            "/african-woman-avatar.jpg",
            "/young-woman-avatar.png",
            "/smiling-woman-avatar.png",
            "/my pic.jpg"
        ]
        const randomAvatar = avatarImages[Math.floor(Math.random() * avatarImages.length)]

        // Insert testimonial - AUTO-APPROVED for verified customers
        await sql`
      INSERT INTO testimonials (username, profile_image, message, is_active, is_approved, customer_id)
      VALUES (${username}, ${randomAvatar}, ${message}, true, true, ${parseInt(session.user.id)})
    `

        revalidatePath("/testimonials")
        revalidatePath("/")

        return { success: true }
    } catch (error) {
        console.error("Error submitting testimonial:", error)
        return { success: false, error: "Failed to submit testimonial" }
    }
}
