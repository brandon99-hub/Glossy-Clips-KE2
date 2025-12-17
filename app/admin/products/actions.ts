"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock_quantity: z.coerce.number().int().min(0, "Stock must be positive"),
    category: z.string().min(1, "Category is required"),
    images: z.string().transform((val) => val.split(",").filter((url) => url.trim() !== "")),
    is_active: z.coerce.boolean().default(true),
})

export async function createProduct(formData: FormData) {
    try {
        const rawData = {
            name: formData.get("name"),
            description: formData.get("description"),
            price: formData.get("price"),
            stock_quantity: formData.get("stock_quantity"),
            category: formData.get("category"),
            images: formData.get("images"),
            is_active: formData.get("is_active") === "on",
        }

        const validatedData = productSchema.parse(rawData)

        // Helper to format array for postgres text[]
        const imagesArray = `{${validatedData.images.map(img => `"${img}"`).join(",")}}`

        // Create slug from name
        const slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4)

        await sql`
      INSERT INTO products (
        name, slug, description, price, stock_quantity, 
        category, images, is_active, created_at
      )
      VALUES (
        ${validatedData.name}, 
        ${slug}, 
        ${validatedData.description}, 
        ${validatedData.price}, 
        ${validatedData.stock_quantity}, 
        ${validatedData.category}, 
        ${imagesArray}, 
        ${validatedData.is_active}, 
        NOW()
      )
    `

        revalidatePath("/admin/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to create product:", error)
        return { success: false, error: "Failed to create product" }
    }
}

export async function updateProduct(formData: FormData) {
    try {
        const id = formData.get("id")
        const rawData = {
            name: formData.get("name"),
            description: formData.get("description"),
            price: formData.get("price"),
            stock_quantity: formData.get("stock_quantity"),
            category: formData.get("category"),
            images: formData.get("images"),
            is_active: formData.get("is_active") === "on",
        }

        const validatedData = productSchema.parse(rawData)
        const imagesArray = `{${validatedData.images.map(img => `"${img}"`).join(",")}}`

        await sql`
        UPDATE products 
        SET 
          name = ${validatedData.name}, 
          description = ${validatedData.description}, 
          price = ${validatedData.price}, 
          stock_quantity = ${validatedData.stock_quantity}, 
          category = ${validatedData.category}, 
          images = ${imagesArray}, 
          is_active = ${validatedData.is_active}
        WHERE id = ${Number(id)}
      `

        revalidatePath("/admin/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to update product:", error)
        return { success: false, error: "Failed to update product" }
    }
}

export async function deleteProduct(id: number) {
    try {
        await sql`DELETE FROM products WHERE id = ${id}`
        revalidatePath("/admin/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete product:", error)
        return { success: false, error: "Failed to delete product" }
    }
}

export async function toggleProductStatus(id: number, isActive: boolean) {
    try {
        await sql`UPDATE products SET is_active = ${isActive} WHERE id = ${id}`
        revalidatePath("/admin/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle product status:", error)
        return { success: false, error: "Failed to toggle status" }
    }
}
