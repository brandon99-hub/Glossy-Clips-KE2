import { NextResponse } from "next/server"
import { sql, type PickupMtaaniLocation } from "@/lib/db"
import { pickupMtaaniClient } from "@/lib/pickup-mtaani"

export async function GET() {
    try {
        // Try to fetch from Pickup Mtaani API
        const apiLocations = await pickupMtaaniClient.getLocations()

        // If API is enabled and returned data, sync to database and return
        if (pickupMtaaniClient.isEnabled() && apiLocations.length > 0) {
            console.log(`[Pickup Mtaani] Fetched ${apiLocations.length} locations from API`)

            // Sync locations to database for caching
            try {
                for (const loc of apiLocations) {
                    await sql`
                        INSERT INTO pickup_mtaani_locations (
                            agent_id, name, area, zone, delivery_fee, is_active
                        ) VALUES (
                            ${loc.id}, 
                            ${loc.name}, 
                            ${loc.area || 'Nairobi'}, 
                            ${loc.zone || 'Nairobi'}, 
                            300, 
                            true
                        )
                        ON CONFLICT (agent_id) 
                        DO UPDATE SET 
                            name = EXCLUDED.name,
                            area = EXCLUDED.area,
                            zone = EXCLUDED.zone,
                            updated_at = NOW()
                    `
                }
            } catch (dbError) {
                console.error('[Pickup Mtaani] Failed to sync to database:', dbError)
            }

            // Return API data formatted for frontend
            return NextResponse.json({
                locations: apiLocations.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    area: loc.area || 'Nairobi',
                    zone: loc.zone || 'Nairobi',
                    delivery_fee: 300, // Default fee, will be calculated dynamically
                    is_active: true
                })),
                source: 'api'
            })
        }

        // Fallback to database
        const dbLocations = await sql`
            SELECT * FROM pickup_mtaani_locations 
            WHERE is_active = true
            ORDER BY area ASC, name ASC
        `

        if (dbLocations.length > 0) {
            console.log(`[Pickup Mtaani] Using ${dbLocations.length} locations from database`)
            return NextResponse.json({ locations: dbLocations, source: 'database' })
        }

        // Final fallback to hardcoded data
        console.log('[Pickup Mtaani] Using fallback hardcoded locations')
        const fallbackLocations = [
            { id: 1, name: "Westlands", area: "Westlands", zone: "Nairobi West", delivery_fee: 300, is_active: true },
            { id: 2, name: "CBD", area: "CBD", zone: "Nairobi Central", delivery_fee: 250, is_active: true },
            { id: 3, name: "Eastleigh", area: "Eastleigh", zone: "Nairobi East", delivery_fee: 300, is_active: true },
            { id: 4, name: "Karen", area: "Karen", zone: "Nairobi South", delivery_fee: 400, is_active: true },
            { id: 5, name: "Kasarani", area: "Kasarani", zone: "Nairobi North", delivery_fee: 350, is_active: true },
        ]

        return NextResponse.json({ locations: fallbackLocations, source: 'fallback' })
    } catch (error) {
        console.error("[Pickup Mtaani] Error in locations endpoint:", error)

        // Return fallback data on error
        const fallbackLocations = [
            { id: 1, name: "Westlands", area: "Westlands", zone: "Nairobi West", delivery_fee: 300, is_active: true },
            { id: 2, name: "CBD", area: "CBD", zone: "Nairobi Central", delivery_fee: 250, is_active: true },
            { id: 3, name: "Eastleigh", area: "Eastleigh", zone: "Nairobi East", delivery_fee: 300, is_active: true },
        ]

        return NextResponse.json({ locations: fallbackLocations, source: 'error_fallback' })
    }
}
