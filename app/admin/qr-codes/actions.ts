"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function markAsExported(id: number) {
    try {
        await sql`
      UPDATE secret_codes 
      SET is_exported = TRUE 
      WHERE id = ${id}
    `
        revalidatePath("/admin/qr-codes")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark QR as exported:", error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function markAsScanned(code: string) {
    try {
        // Only mark as scanned if not already scanned (one-time only)
        const result = await sql`
      UPDATE secret_codes 
      SET is_scanned = TRUE, scanned_at = NOW()
      WHERE code = ${code} AND is_scanned = FALSE
      RETURNING id
    `

        if (result.length === 0) {
            return { success: false, error: "Code already scanned or invalid" }
        }

        revalidatePath("/admin/qr-codes")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark QR as scanned:", error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function markAsUsed(code: string, orderId: number) {
    try {
        await sql`
      UPDATE secret_codes 
      SET is_used = TRUE, used_at = NOW(), order_id = ${orderId}
      WHERE code = ${code}
    `
        revalidatePath("/admin/qr-codes")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark QR as used:", error)
        return { success: false, error: "Failed to update status" }
    }
}
