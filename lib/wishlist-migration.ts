"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"

/**
 * Migrates session-based wishlist items to a customer account
 * Called after login or registration
 */
export async function migrateWishlistToAccount(customerId: number) {
    try {
        const cookieStore = await cookies()
        const sessionId = cookieStore.get("session_id")?.value

        if (!sessionId) {
            return { success: true, migrated: 0 }
        }

        // Get all wishlist items for this session
        const sessionWishlist = await sql`
      SELECT product_id FROM wishlists
      WHERE session_id = ${sessionId}
      AND customer_id IS NULL
    `

        if (sessionWishlist.length === 0) {
            return { success: true, migrated: 0 }
        }

        // Check which products are already in customer's wishlist
        const existingWishlist = await sql`
      SELECT product_id FROM wishlists
      WHERE customer_id = ${customerId}
    `

        const existingProductIds = existingWishlist.map((w: any) => w.product_id)

        // Migrate items that aren't already in customer's wishlist
        let migratedCount = 0
        for (const item of sessionWishlist) {
            if (!existingProductIds.includes(item.product_id)) {
                // Update session wishlist item to link to customer
                await sql`
          UPDATE wishlists
          SET customer_id = ${customerId}, session_id = NULL
          WHERE session_id = ${sessionId}
          AND product_id = ${item.product_id}
          AND customer_id IS NULL
        `
                migratedCount++
            } else {
                // Delete duplicate session wishlist item
                await sql`
          DELETE FROM wishlists
          WHERE session_id = ${sessionId}
          AND product_id = ${item.product_id}
          AND customer_id IS NULL
        `
            }
        }

        return { success: true, migrated: migratedCount }
    } catch (error) {
        console.error("Wishlist migration error:", error)
        return { success: false, error: "Failed to migrate wishlist" }
    }
}

/**
 * Gets customer's wishlist (for logged-in users)
 */
export async function getCustomerWishlist(customerId: number) {
    try {
        const wishlist = await sql`
      SELECT w.*, p.name, p.slug, p.price, p.images, p.stock_quantity
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.customer_id = ${customerId}
      AND p.is_active = true
      ORDER BY w.created_at DESC
    `

        return { success: true, wishlist }
    } catch (error) {
        console.error("Get wishlist error:", error)
        return { success: false, error: "Failed to get wishlist" }
    }
}

/**
 * Adds item to customer's wishlist
 */
export async function addToCustomerWishlist(customerId: number, productId: number) {
    try {
        // Check if already in wishlist
        const existing = await sql`
      SELECT id FROM wishlists
      WHERE customer_id = ${customerId}
      AND product_id = ${productId}
    `

        if (existing.length > 0) {
            return { success: false, error: "Already in wishlist" }
        }

        await sql`
      INSERT INTO wishlists (customer_id, product_id)
      VALUES (${customerId}, ${productId})
    `

        return { success: true }
    } catch (error) {
        console.error("Add to wishlist error:", error)
        return { success: false, error: "Failed to add to wishlist" }
    }
}

/**
 * Removes item from customer's wishlist
 */
export async function removeFromCustomerWishlist(customerId: number, productId: number) {
    try {
        await sql`
      DELETE FROM wishlists
      WHERE customer_id = ${customerId}
      AND product_id = ${productId}
    `

        return { success: true }
    } catch (error) {
        console.error("Remove from wishlist error:", error)
        return { success: false, error: "Failed to remove from wishlist" }
    }
}
