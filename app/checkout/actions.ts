"use server"

import { sql, type CartItem } from "@/lib/db"
import { orderSchema, type OrderInput } from "@/lib/validation"

function generateReferenceCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "CG"
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function createOrder(data: OrderInput) {
  try {
    // Validate input data
    const validated = orderSchema.parse(data)
    const referenceCode = generateReferenceCode()

    await sql`
      INSERT INTO orders (
        reference_code, 
        customer_name, 
        phone_number, 
        pickup_location, 
        items, 
        total_amount,
        delivery_method,
        delivery_fee,
        pickup_mtaani_location,
        status
      ) VALUES (
        ${referenceCode},
        ${validated.customerName},
        ${validated.phoneNumber},
        ${validated.pickupLocation},
        ${JSON.stringify(validated.items)},
        ${validated.totalAmount},
        ${validated.deliveryMethod || "self-pickup"},
        ${validated.deliveryFee || 0},
        ${validated.pickupMtaaniLocationId ? validated.pickupLocation : null},
        'pending'
      )
    `

    return { success: true, referenceCode }
  } catch (error) {
    console.error("Error creating order:", error)

    // Return validation errors if it's a Zod error
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, error: "Invalid order data. Please check your inputs." }
    }

    return { success: false, error: "Failed to create order" }
  }
}
