import { NextResponse } from "next/server"
import { sql, type Product } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const { productIds } = await request.json()

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ products: [] })
        }

        // Fetch products by IDs
        const products = await sql<Product[]>`
      SELECT * FROM products 
      WHERE id = ANY(${productIds}) 
      AND is_active = true
      ORDER BY created_at DESC
    `

        return NextResponse.json({ products })
    } catch (error) {
        console.error("Error fetching wishlist products:", error)
        return NextResponse.json(
            { error: "Failed to load wishlist" },
            { status: 500 }
        )
    }
}
