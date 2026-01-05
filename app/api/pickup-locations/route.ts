import { NextResponse } from "next/server"
import { sql, type PickupMtaaniLocation } from "@/lib/db"
import { pickupMtaaniClient } from "@/lib/pickup-mtaani"

export async function GET() {
    try {
        // Fetch from database - The primary source of truth for 246 locations
        // We include coordinates and description for "smart" display
        const dbLocations = await sql`
            SELECT 
                id, 
                agent_id, 
                name, 
                area, 
                zone, 
                delivery_fee, 
                is_active, 
                latitude, 
                longitude, 
                description, 
                google_maps_url,
                CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN true ELSE false END as has_gps
            FROM pickup_mtaani_locations 
            WHERE is_active = true 
            ORDER BY area ASC, name ASC
        `

        if (dbLocations.length > 0) {
            console.log(`[Pickup Mtaani] Serving ${dbLocations.length} locations from database`)

            // Calculate real-time fees relative to Joggers Hub
            const locationsWithFees = dbLocations.map(loc => {
                const range = pickupMtaaniClient.calculateLocalFee(
                    'TMALL(LANGATA RD)', // Hub Area
                    loc.area || 'Unknown',
                    'small' // Default size for modal display
                )
                return {
                    ...loc,
                    delivery_fee_min: range.min,
                    delivery_fee_max: range.max,
                    delivery_fee: range.min // Fallback for components still using the old property
                }
            })

            return NextResponse.json({
                locations: locationsWithFees,
                source: 'database_dynamic',
                count: locationsWithFees.length
            })
        }

        // Emergency fallback if database is empty - return empty list to avoid UI crash
        console.warn('[Pickup Mtaani] No locations found in database')
        return NextResponse.json({
            locations: [],
            source: 'database_empty',
            count: 0
        })
    } catch (error) {
        console.error("[Pickup Mtaani] Error in locations endpoint:", error)
        return NextResponse.json(
            { error: "Failed to fetch pickup locations", locations: [] },
            { status: 500 }
        )
    }
}
