import { NextResponse } from "next/server"
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

        // Use default origin if not provided (your store location)
        const origin = origin_agent_id || parseInt(process.env.PICKUP_MTAANI_DEFAULT_ORIGIN_AGENT || '1')

        // Estimate package size based on cart
        const packageSize = pickupMtaaniClient.estimatePackageSize(
            cart_total || 0,
            cart_items || 1
        )

        console.log(`[Delivery Charge] Calculating for origin:${origin} → destination:${destination_agent_id}, size:${packageSize}`)

        // Calculate delivery charge
        const result = await pickupMtaaniClient.calculateDeliveryCharge({
            origin_agent_id: origin,
            destination_agent_id: parseInt(destination_agent_id),
            package_size: packageSize,
        })

        return NextResponse.json({
            delivery_fee: result.fee,
            package_size: packageSize,
            currency: result.currency,
            provider: pickupMtaaniClient.isEnabled() ? 'pickup_mtaani' : 'fallback',
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
