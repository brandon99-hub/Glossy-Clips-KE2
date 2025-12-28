import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customerId, sessionId, cartItems, totalAmount } = body

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 })
        }

        // Check if cart already exists for this customer/session
        const existing = customerId
            ? await sql`
          SELECT id FROM abandoned_carts 
          WHERE customer_id = ${customerId} 
          ORDER BY created_at DESC 
          LIMIT 1
        `
            : await sql`
          SELECT id FROM abandoned_carts 
          WHERE session_id = ${sessionId} 
          ORDER BY created_at DESC 
          LIMIT 1
        `

        if (existing.length > 0) {
            // Update existing cart
            await sql`
        UPDATE abandoned_carts 
        SET cart_items = ${JSON.stringify(cartItems)},
            total_amount = ${totalAmount},
            updated_at = NOW()
        WHERE id = ${existing[0].id}
      `
        } else {
            // Create new abandoned cart entry
            await sql`
        INSERT INTO abandoned_carts (
          customer_id,
          session_id,
          cart_items,
          total_amount,
          email_sent,
          recovered
        ) VALUES (
          ${customerId || null},
          ${sessionId || null},
          ${JSON.stringify(cartItems)},
          ${totalAmount},
          false,
          false
        )
      `
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error saving abandoned cart:", error)
        return NextResponse.json({ success: false, error: "Failed to save cart" }, { status: 500 })
    }
}
