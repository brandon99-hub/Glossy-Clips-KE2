import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sendAbandonedCartEmails } from "@/lib/abandoned-cart"

export async function GET(request: Request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get("authorization")
        const cronSecret = process.env.CRON_SECRET || "your-secret-key"

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const result = await sendAbandonedCartEmails()

        return NextResponse.json(result)
    } catch (error) {
        console.error("Cron job error:", error)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}
