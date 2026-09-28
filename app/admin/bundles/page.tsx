import { sql } from "@/lib/db"
import type { Bundle, Product } from "@/types/db"
import { BundlesManager } from "./bundles-manager"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export const dynamic = "force-dynamic"

async function getBundles(): Promise<Bundle[]> {
  try {
    const bundles = await sql`
      SELECT * FROM bundles ORDER BY created_at DESC
    `
    return bundles as Bundle[]
  } catch {
    return []
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const products = await sql`
      SELECT id, name, price, images FROM products WHERE is_active = true ORDER BY name
    `
    return products as Product[]
  } catch {
    return []
  }
}

export default async function BundlesPage() {
  const [bundles, products] = await Promise.all([getBundles(), getProducts()])

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Bundle Deals"
        description="Create special product bundles and promotional combos to boost sales."
      />
      <BundlesManager initialBundles={bundles} products={products} />
    </div>
  )
}
