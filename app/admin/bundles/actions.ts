"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

const DEFAULT_BUNDLE_IMAGES = [
  "/cute summer fridays lip gloss key chain charm….jpg",
  "/i love the new charms.jpg",
  "/Keep your lippie with you wherever you go by….jpg",
  "/my pic.jpg",
]

function getRandomDefaultImage() {
  return DEFAULT_BUNDLE_IMAGES[Math.floor(Math.random() * DEFAULT_BUNDLE_IMAGES.length)]
}

export async function createBundle(data: {
  name: string
  description: string
  product_ids: number[]
  original_price: number
  bundle_price: number
  savings: number
  bundle_image?: string | null
}) {
  try {
    // If no image provided, use a random default
    const imageToUse = data.bundle_image || getRandomDefaultImage()

    const result = await sql`
      INSERT INTO bundles (name, description, product_ids, original_price, bundle_price, savings, bundle_image)
      VALUES (${data.name}, ${data.description}, ${data.product_ids}, ${data.original_price}, ${data.bundle_price}, ${data.savings}, ${imageToUse})
      RETURNING *
    `
    revalidatePath("/admin/bundles")
    revalidatePath("/bundles")
    revalidatePath("/")
    return { success: true, bundle: result[0] }
  } catch (error) {
    console.error("Error creating bundle:", error)
    return { success: false, error: "Failed to create bundle" }
  }
}

export async function updateBundle(id: number, data: {
  name: string
  description: string
  product_ids: number[]
  original_price: number
  bundle_price: number
  savings: number
  bundle_image?: string | null
}) {
  try {
    // If no image provided, keep existing or use random default
    const imageToUse = data.bundle_image || getRandomDefaultImage()

    const result = await sql`
      UPDATE bundles 
      SET name = ${data.name}, 
          description = ${data.description}, 
          product_ids = ${data.product_ids}, 
          original_price = ${data.original_price}, 
          bundle_price = ${data.bundle_price}, 
          savings = ${data.savings},
          bundle_image = ${imageToUse}
      WHERE id = ${id}
      RETURNING *
    `
    revalidatePath("/admin/bundles")
    revalidatePath("/bundles")
    revalidatePath("/")
    return { success: true, bundle: result[0] }
  } catch (error) {
    console.error("Error updating bundle:", error)
    return { success: false, error: "Failed to update bundle" }
  }
}

export async function deleteBundle(id: number) {
  try {
    await sql`DELETE FROM bundles WHERE id = ${id}`
    revalidatePath("/admin/bundles")
    revalidatePath("/bundles")
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
    revalidatePath("/bundles")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error toggling bundle status:", error)
    return { success: false, error: "Failed to update bundle" }
  }
}
