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
