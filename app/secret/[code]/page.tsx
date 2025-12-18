import { notFound } from "next/navigation"
import { sql, type SecretCode, type Product } from "@/lib/db"
import { SecretMenuPage } from "./secret-menu"
import { markAsScanned } from "@/app/admin/qr-codes/actions"

export default async function SecretPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  // Validate the secret code
  const codes = await sql`
    SELECT * FROM secret_codes 
    WHERE code = ${code}
  `

  if (!codes.length) {
    notFound()
  }

  const secretCode = codes[0] as SecretCode

  // Check if expired
  const isExpired = secretCode.expires_at && new Date(secretCode.expires_at) < new Date()

  // Check if already scanned (one-time scan only)
  const alreadyScanned = secretCode.is_scanned

  // Mark as scanned if this is the first scan
  if (!alreadyScanned && !isExpired && !secretCode.is_used) {
    await markAsScanned(code)
  }

  // Fetch secret products
  const secretProducts = await sql`
    SELECT * FROM products 
    WHERE is_secret = true AND is_active = true
    ORDER BY created_at DESC
  `

  return <SecretMenuPage secretCode={secretCode} products={secretProducts as Product[]} isExpired={isExpired || false} alreadyScanned={alreadyScanned || false} />
}
