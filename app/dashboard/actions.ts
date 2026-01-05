"use server"

import { auth } from "@/lib/auth-helper"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { Order, CustomerAddress, CustomerReview } from "@/lib/db"

export async function getCustomerOrders() {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const orders = await sql`
      SELECT o.*, 
        sc.code as secret_code,
        EXISTS(
          SELECT 1 FROM bundles b 
          WHERE b.is_active = true 
          AND b.product_ids <@ (
            SELECT array_agg((item->>'product_id')::int) 
            FROM jsonb_array_elements(o.items) AS item
          )
        ) as has_bundle
      FROM orders o
      LEFT JOIN secret_codes sc ON sc.order_id = o.id AND sc.is_used = true
      WHERE o.customer_id = ${parseInt(session.user.id)}
      ORDER BY o.created_at DESC
    ` as Order[]

        return { success: true, orders }
    } catch (error) {
        console.error("Error fetching orders:", error)
        return { success: false, error: "Failed to fetch orders" }
    }
}

export async function reorderItems(orderId: number) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const orders = await sql`
      SELECT items, pickup_location, phone_number, pickup_mtaani_location FROM orders 
      WHERE id = ${orderId} AND customer_id = ${parseInt(session.user.id)}
    ` as Order[]

        if (orders.length === 0) {
            return { success: false, error: "Order not found" }
        }

        return {
            success: true,
            items: orders[0].items,
            pickupLocation: orders[0].pickup_location,
            phoneNumber: orders[0].phone_number,
            pickupMtaaniLocation: orders[0].pickup_mtaani_location
        }
    } catch (error) {
        console.error("Error reordering:", error)
        return { success: false, error: "Failed to reorder" }
    }
}

export async function getCustomerProfile() {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const customers = await sql`
      SELECT id, email, name, phone_number, created_at
      FROM customers
      WHERE id = ${parseInt(session.user.id)}
    `

        if (customers.length === 0) {
            return { success: false, error: "Customer not found" }
        }

        return { success: true, customer: customers[0] }
    } catch (error) {
        console.error("Error fetching profile:", error)
        return { success: false, error: "Failed to fetch profile" }
    }
}

export async function updateCustomerProfile(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string

    try {
        await sql`
      UPDATE customers
      SET name = ${name}, phone_number = ${phone}, updated_at = NOW()
      WHERE id = ${parseInt(session.user.id)}
    `

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: "Failed to update profile" }
    }
}

export async function getCustomerAddresses() {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const addresses = await sql`
      SELECT * FROM customer_addresses
      WHERE customer_id = ${parseInt(session.user.id)}
      ORDER BY is_default DESC, created_at DESC
    ` as CustomerAddress[]

        return { success: true, addresses }
    } catch (error) {
        console.error("Error fetching addresses:", error)
        return { success: false, error: "Failed to fetch addresses" }
    }
}

export async function addCustomerAddress(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    const location = formData.get("location") as string
    const phone = formData.get("phone") as string
    const addressType = formData.get("addressType") as string || 'door_to_door'
    const isDefault = formData.get("isDefault") === "on"

    try {
        // If setting as default, unset other defaults
        if (isDefault) {
            await sql`
        UPDATE customer_addresses
        SET is_default = false
        WHERE customer_id = ${parseInt(session.user.id)}
      `
        }

        await sql`
      INSERT INTO customer_addresses (customer_id, location, phone_number, address_type, is_default)
      VALUES (${parseInt(session.user.id)}, ${location}, ${phone}, ${addressType}, ${isDefault})
    `

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error adding address:", error)
        return { success: false, error: "Failed to add address" }
    }
}

export async function deleteCustomerAddress(addressId: number) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        await sql`
      DELETE FROM customer_addresses
      WHERE id = ${addressId} AND customer_id = ${parseInt(session.user.id)}
    `

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error deleting address:", error)
        return { success: false, error: "Failed to delete address" }
    }
}

export async function submitProductReview(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    const productId = parseInt(formData.get("productId") as string)
    const orderId = parseInt(formData.get("orderId") as string)
    const rating = parseInt(formData.get("rating") as string)
    const reviewText = formData.get("reviewText") as string

    try {
        // Verify customer actually purchased this product
        const orders = await sql`
      SELECT id FROM orders
      WHERE id = ${orderId} 
      AND customer_id = ${parseInt(session.user.id)}
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(items) AS item
        WHERE (item->>'product_id')::int = ${productId}
      )
    `

        if (orders.length === 0) {
            return { success: false, error: "You haven't purchased this product" }
        }

        // Insert review (auto-approved)
        await sql`
      INSERT INTO customer_reviews (
        product_id, customer_id, order_id, rating, review_text, is_approved
      )
      VALUES (${productId}, ${parseInt(session.user.id)}, ${orderId}, ${rating}, ${reviewText}, true)
      ON CONFLICT (product_id, customer_id, order_id) 
      DO UPDATE SET rating = ${rating}, review_text = ${reviewText}
    `

        revalidatePath(`/product/${productId}`)
        return { success: true }
    } catch (error) {
        console.error("Error submitting review:", error)
        return { success: false, error: "Failed to submit review" }
    }
}

export async function deleteCustomerAccount() {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const customerId = parseInt(session.user.id)

        // Anonymize orders (keep for records)
        await sql`
      UPDATE orders
      SET customer_id = NULL,
          customer_name = 'Deleted User',
          phone_number = 'REDACTED'
      WHERE customer_id = ${customerId}
    `

        // Delete personal data
        await sql`DELETE FROM customer_addresses WHERE customer_id = ${customerId}`
        await sql`DELETE FROM wishlists WHERE customer_id = ${customerId}`
        await sql`DELETE FROM product_waitlists WHERE customer_id = ${customerId}`
        await sql`DELETE FROM abandoned_carts WHERE customer_id = ${customerId}`
        await sql`DELETE FROM customer_reviews WHERE customer_id = ${customerId}`

        // Delete account
        await sql`DELETE FROM customers WHERE id = ${customerId}`

        return { success: true }
    } catch (error) {
        console.error("Error deleting account:", error)
        return { success: false, error: "Failed to delete account" }
    }
}

export async function getCustomerWaitlist() {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const waitlistItems = await sql`
      SELECT 
        pw.*,
        p.id as product_id,
        p.name,
        p.slug,
        p.price,
        p.images,
        p.stock_quantity,
        p.is_active
      FROM product_waitlists pw
      JOIN products p ON p.id = pw.product_id
      WHERE pw.customer_id = ${parseInt(session.user.id)}
      ORDER BY pw.created_at DESC
    `

        return { success: true, waitlistItems }
    } catch (error) {
        console.error("Error fetching waitlist:", error)
        return { success: false, error: "Failed to fetch waitlist" }
    }
}

export async function removeFromWaitlist(productId: number) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        await sql`
      DELETE FROM product_waitlists
      WHERE product_id = ${productId} AND customer_id = ${parseInt(session.user.id)}
    `

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error removing from waitlist:", error)
        return { success: false, error: "Failed to remove from waitlist" }
    }
}
