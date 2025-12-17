"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createBundle(data: {
  name: string
  description: string
  product_ids: number[]
  original_price: number
  bundle_price: number
  savings: number
}) {
  try {
    const result = await sql`
      INSERT INTO bundles (name, description, product_ids, original_price, bundle_price, savings)
      VALUES (${data.name}, ${data.description}, ${data.product_ids}, ${data.original_price}, ${data.bundle_price}, ${data.savings})
      RETURNING *
    `
    revalidatePath("/admin/bundles")
    revalidatePath("/")
    return { success: true, bundle: result[0] }
  } catch (error) {
    console.error("Error creating bundle:", error)
    return { success: false, error: "Failed to create bundle" }
  }
}

export async function deleteBundle(id: number) {
  try {
    await sql`DELETE FROM bundles WHERE id = ${id}`
    revalidatePath("/admin/bundles")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting bundle:", error)
    return { success: false, error: "Failed to delete bundle" }
  }
}

export async function toggleBundleStatus(id: number, isActive: boolean) {
  try {
    await sql`UPDATE bundles SET is_active = ${isActive} WHERE id = ${id}`
    revalidatePath("/admin/bundles")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error toggling bundle status:", error)
    return { success: false, error: "Failed to update bundle" }
  }
}
