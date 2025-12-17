import { NextResponse } from "next/server"
import { sql, type PickupMtaaniLocation } from "@/lib/db"

export async function GET() {
    try {
        const locations = await sql<PickupMtaaniLocation[]>`
      SELECT * FROM pickup_mtaani_locations 
      WHERE is_active = true
      ORDER BY area ASC, name ASC
    `

        return NextResponse.json({ locations })
    } catch (error) {
        console.error("Error fetching pickup locations:", error)
        return NextResponse.json(
            { error: "Failed to load pickup locations" },
            { status: 500 }
        )
    }
}
