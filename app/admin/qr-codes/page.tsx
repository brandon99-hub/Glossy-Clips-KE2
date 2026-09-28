import { sql, type SecretCode } from "@/lib/db"
import QRCode from "qrcode"
import { redirect } from "next/navigation"
import { QRCodesClient } from "@/components/admin/qr-codes-client"
import { verifyAdminSession } from "@/lib/admin-auth"

export default async function AdminQRCodesPage() {
  const isLoggedIn = await verifyAdminSession()

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  const secretCodes = (await sql`
    SELECT sc.*, o.reference_code as order_reference
    FROM secret_codes sc
    LEFT JOIN orders o ON sc.order_id = o.id
    ORDER BY sc.created_at DESC
  `) as (SecretCode & { order_reference?: string })[]

  // Generate QR codes
  const codesWithQr = await Promise.all(
    secretCodes.map(async (sc) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
      const secretUrl = `${baseUrl}/secret/${sc.code}`

      if (!baseUrl) {
        console.warn(`[WARNING] NEXT_PUBLIC_APP_URL is not set. QR code for ${sc.code} will be relative and might not work on mobile devices.`)
      }

      try {
        const qrCodeData = await QRCode.toDataURL(secretUrl)
        return { ...sc, secretUrl, qrCodeData }
      } catch (err) {
        console.error("QR Gen Error:", err)
        return { ...sc, secretUrl, qrCodeData: null }
      }
    }),
  )

  return <QRCodesClient codesWithQr={codesWithQr} />
}
