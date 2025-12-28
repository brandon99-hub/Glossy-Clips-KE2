import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get("q")

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, results: [] })
        }

        // Use full-text search with existing indexes
        const results = await sql`
      SELECT 
        id,
        name,
        slug,
        price,
        images[1] as image,
        stock_quantity,
        category
      FROM products
      WHERE 
        is_active = true 
        AND is_secret = false
        AND (
          to_tsvector('english', name || ' ' || COALESCE(description, '')) 
          @@ plainto_tsquery('english', ${query})
          OR name ILIKE ${`%${query}%`}
        )
      ORDER BY 
        CASE 
          WHEN name ILIKE ${`${query}%`} THEN 1
          WHEN name ILIKE ${`%${query}%`} THEN 2
          ELSE 3
        END,
        stock_quantity DESC
      LIMIT 5
    `

        const products = results.map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            price: parseFloat(row.price),
            image: row.image || "/placeholder.svg",
            stock_quantity: row.stock_quantity || 0,
            category: row.category,
        }))

        return NextResponse.json({ success: true, results: products })
    } catch (error) {
        console.error("Autocomplete search error:", error)
        return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 })
    }
}
