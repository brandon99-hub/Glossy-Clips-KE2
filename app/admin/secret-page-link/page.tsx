import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

function generateSecretCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default async function SecretPageLinkPage() {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get("admin_session")

    if (!isLoggedIn) {
        redirect("/admin/login")
    }

    // Get any secret code (active or not) for admin preview
    const codes = await sql`
    SELECT code FROM secret_codes 
    ORDER BY created_at DESC
    LIMIT 1
  `

    if (codes.length > 0) {
        // Redirect to the actual secret page
        redirect(`/secret/${codes[0].code}`)
    } else {
        // No codes exist, create a temporary demo code for admin
        const demoCode = generateSecretCode()
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 3)

        await sql`
      INSERT INTO secret_codes (code, discount_percent, expires_at, is_scanned, is_used)
      VALUES (${demoCode}, 10, ${expiresAt.toISOString()}, false, false)
    `

        redirect(`/secret/${demoCode}`)
    }
}
