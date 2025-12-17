import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const bundleId = parseInt(id)

        if (isNaN(bundleId)) {
            return NextResponse.json({ error: "Invalid bundle ID" }, { status: 400 })
        }

        // Get bundle with product_ids
        const bundles = await sql`
      SELECT product_ids FROM bundles WHERE id = ${bundleId}
    `

        if (bundles.length === 0) {
            return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
        }

        const productIds = bundles[0].product_ids as number[]

        if (!productIds || productIds.length === 0) {
            return NextResponse.json({ products: [] })
        }

        // Fetch products
        const products = await sql`
      SELECT id, name, price, images 
      FROM products 
      WHERE id = ANY(${productIds})
    `

        return NextResponse.json({ products })
    } catch (error) {
        console.error("Error fetching bundle products:", error)
        return NextResponse.json(
            { error: "Failed to fetch bundle products" },
            { status: 500 }
        )
    }
}
