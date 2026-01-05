import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { pickupMtaaniClient } from "@/lib/pickup-mtaani"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { origin_agent_id, destination_agent_id, cart_total, cart_items } = body

        // Validate inputs
        if (!destination_agent_id) {
            return NextResponse.json(
                { error: "Destination location is required" },
                { status: 400 }
            )
        }

        // Use Joggers Hub (5259) as default origin
        const originId = origin_agent_id || 5259

        // Fetch areas from database to enable zone-based calculation
        const agents = await sql`
            SELECT id, area FROM pickup_mtaani_locations 
            WHERE id IN (${originId}, ${parseInt(destination_agent_id)})
        `

        const originAgent = agents.find(a => a.id === originId)
        const destAgent = agents.find(a => a.id === parseInt(destination_agent_id))

        // Estimate package size based on cart
        const packageSize = pickupMtaaniClient.estimatePackageSize(
            cart_total || 0,
            cart_items || 1
        )

        console.log(`[Delivery Charge] Calculating: ${originAgent?.area || 'Hub'} → ${destAgent?.area || 'Unknown'}, size:${packageSize}`)

        // Calculate delivery charge using local logic
        const result = await pickupMtaaniClient.calculateDeliveryCharge({
            origin_agent_id: originId,
            destination_agent_id: parseInt(destination_agent_id),
            origin_area: originAgent?.area || 'TMALL(LANGATA RD)',
            destination_area: destAgent?.area || 'Unknown',
            package_size: packageSize,
        })

        return NextResponse.json({
            delivery_fee: result.fee,
            delivery_fee_min: result.fee_min,
            delivery_fee_max: result.fee_max,
            package_size: packageSize,
            currency: result.currency,
            origin_area: originAgent?.area || 'TMALL(LANGATA RD)',
            destination_area: destAgent?.area || 'Unknown',
            provider: 'pickup_mtaani_local',
        })
    } catch (error) {
        console.error("[Delivery Charge] Error calculating fee:", error)

        // Return fallback rate on error
        return NextResponse.json({
            delivery_fee: 300,
            package_size: 'medium',
            currency: 'KES',
            provider: 'fallback',
        })
    }
}
