import { sql } from "@/lib/db"
import { sendAbandonedCartEmail } from "@/lib/email"

export async function sendAbandonedCartEmails() {
    try {
        // Find carts abandoned more than 24 hours ago that haven't been emailed
        const abandonedCarts = await sql`
      SELECT 
        ac.*,
        c.email,
        c.name as customer_name
      FROM abandoned_carts ac
      LEFT JOIN customers c ON ac.customer_id = c.id
      WHERE 
        ac.email_sent = false
        AND ac.recovered = false
        AND ac.created_at < NOW() - INTERVAL '24 hours'
        AND c.email IS NOT NULL
      LIMIT 50
    `

        let emailsSent = 0
        let errors = 0

        for (const cart of abandonedCarts) {
            try {
                const result = await sendAbandonedCartEmail(
                    cart.email,
                    cart.customer_name || "Valued Customer",
                    cart.cart_items
                )

                if (result.success) {
                    // Mark as emailed
                    await sql`
            UPDATE abandoned_carts 
            SET email_sent = true, updated_at = NOW()
            WHERE id = ${cart.id}
          `
                    emailsSent++
                } else {
                    errors++
                }
            } catch (error) {
                console.error(`Failed to send email for cart ${cart.id}:`, error)
                errors++
            }
        }

        return {
            success: true,
            emailsSent,
            errors,
            totalProcessed: abandonedCarts.length,
        }
    } catch (error) {
        console.error("Error in sendAbandonedCartEmails:", error)
        return {
            success: false,
            error: "Failed to process abandoned carts",
        }
    }
}
