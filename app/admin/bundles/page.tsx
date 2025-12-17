import { sql } from "@/lib/db"
import { BundlesManager } from "./bundles-manager"

export const dynamic = "force-dynamic"

async function getBundles() {
  try {
    const bundles = await sql`
      SELECT * FROM bundles ORDER BY created_at DESC
    `
    return bundles
  } catch {
    return []
  }
}

async function getProducts() {
  try {
    const products = await sql`
      SELECT id, name, price, images FROM products WHERE is_active = true ORDER BY name
    `
    return products
  } catch {
    return []
  }
}

export default async function BundlesPage() {
  const [bundles, products] = await Promise.all([getBundles(), getProducts()])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Bundle Deals</h1>
        <p className="text-muted-foreground">Create special combo deals to boost sales</p>
      </div>

      <BundlesManager initialBundles={bundles} products={products} />
    </div>
  )
}
