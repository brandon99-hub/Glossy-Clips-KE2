"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { notifyWaitlist } from "@/app/api/waitlist/actions"
import { revalidatePath } from "next/cache"

export async function getAdminWaitlistData() {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get("admin_session")

    if (!isLoggedIn) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        // Get all products with waitlist counts
        const waitlistData = await sql`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.images,
        p.price,
        p.stock_quantity,
        p.is_active,
        COUNT(pw.id) as waitlist_count,
        SUM(CASE WHEN pw.notified = false THEN 1 ELSE 0 END) as pending_count
      FROM products p
      LEFT JOIN product_waitlists pw ON pw.product_id = p.id
      GROUP BY p.id
      HAVING COUNT(pw.id) > 0
      ORDER BY waitlist_count DESC, p.name ASC
    `

        return { success: true, data: waitlistData }
    } catch (error) {
        console.error("Error fetching waitlist data:", error)
        return { success: false, error: "Failed to fetch waitlist data" }
    }
}

export async function getProductWaitlistDetails(productId: number) {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get("admin_session")

    if (!isLoggedIn) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const waitlistEntries = await sql`
      SELECT 
        pw.*,
        c.name as customer_name,
        c.email as customer_email
      FROM product_waitlists pw
      LEFT JOIN customers c ON c.id = pw.customer_id
      WHERE pw.product_id = ${productId}
      ORDER BY pw.created_at DESC
    `

        return { success: true, entries: waitlistEntries }
    } catch (error) {
        console.error("Error fetching product waitlist:", error)
        return { success: false, error: "Failed to fetch product waitlist" }
    }
}

export async function notifyProductWaitlist(productId: number) {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get("admin_session")

    if (!isLoggedIn) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const result = await notifyWaitlist(productId)
        revalidatePath("/admin/waitlist")
        return result
    } catch (error) {
        console.error("Error notifying waitlist:", error)
        return { success: false, error: "Failed to notify waitlist" }
    }
}

export async function getTotalWaitlistCount() {
    try {
        const result = await sql`
      SELECT COUNT(DISTINCT id) as total
      FROM product_waitlists
    `
        return result[0]?.total || 0
    } catch (error) {
        console.error("Error getting waitlist count:", error)
        return 0
    }
}
