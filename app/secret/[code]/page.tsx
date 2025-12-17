import { notFound } from "next/navigation"
import { sql, type SecretCode, type Product } from "@/lib/db"
import { SecretMenuPage } from "./secret-menu"

export default async function SecretPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  // Validate the secret code
  const codes = await sql<SecretCode[]>`
    SELECT * FROM secret_codes 
    WHERE code = ${code}
  `

  if (!codes.length) {
    notFound()
  }

  const secretCode = codes[0]

  // Check if expired
  const isExpired = secretCode.expires_at && new Date(secretCode.expires_at) < new Date()

  // Fetch secret products
  const secretProducts = await sql<Product[]>`
    SELECT * FROM products 
    WHERE is_secret = true AND is_active = true
    ORDER BY created_at DESC
  `

  return <SecretMenuPage secretCode={secretCode} products={secretProducts} isExpired={isExpired || false} />
}
