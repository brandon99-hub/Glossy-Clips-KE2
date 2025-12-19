"use server"

import { sql, type Order } from "@/lib/db"

function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "GC"
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function generateSecretCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"
  let code = ""
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function updateOrderStatus(orderId: number, newStatus: Order["status"]) {
  try {
    // If confirming payment, create gift card and QR code
    if (newStatus === "paid") {
      // Get discount setting from database
      const discountSetting = await sql`
        SELECT setting_value FROM app_settings 
        WHERE setting_key = 'secret_discount_percent'
      `
      const discountPercent = discountSetting.length > 0
        ? parseInt(discountSetting[0].setting_value)
        : 10

      // Create gift card (random value between 50-200)
      const giftValue = Math.floor(Math.random() * 4 + 1) * 50 // 50, 100, 150, or 200
      const giftCode = generateGiftCardCode()

      const giftCardResult = await sql`
        INSERT INTO gift_cards (code, value, order_id)
        VALUES (${giftCode}, ${giftValue}, ${orderId})
        RETURNING id
      `

      const giftCardId = giftCardResult[0]?.id

      // Create secret QR code with dynamic discount
      const secretCode = generateSecretCode()
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 3) // Expires in 3 months

      await sql`
        INSERT INTO secret_codes (code, order_id, discount_percent, expires_at)
        VALUES (${secretCode}, ${orderId}, ${discountPercent}, ${expiresAt.toISOString()})
      `

      // Update order with gift card and mark as paid
      await sql`
        UPDATE orders 
        SET status = ${newStatus}, 
            mpesa_confirmed = true,
            gift_card_id = ${giftCardId},
            updated_at = NOW()
        WHERE id = ${orderId}
      `
    } else {
      await sql`
        UPDATE orders 
        SET status = ${newStatus}, updated_at = NOW()
        WHERE id = ${orderId}
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating order:", error)
    return { success: false, error: "Failed to update order" }
  }
}
