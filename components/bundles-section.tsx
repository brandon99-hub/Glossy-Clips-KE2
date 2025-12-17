import { sql } from "@/lib/db"
import { BundleCard } from "./bundle-card"

async function getBundles() {
  try {
    const bundles = await sql`
      SELECT * FROM bundles WHERE is_active = true ORDER BY created_at DESC LIMIT 4
    `

    // Get product details for each bundle
    const bundlesWithProducts = await Promise.all(
      bundles.map(async (bundle: { id: number; product_ids: number[] }) => {
        const products = await sql`
          SELECT id, name, images FROM products WHERE id = ANY(${bundle.product_ids})
        `
        return { ...bundle, products }
      }),
    )

    return bundlesWithProducts
  } catch {
    return []
  }
}

export async function BundlesSection() {
  const bundles = await getBundles()

  if (bundles.length === 0) return null

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold">Bundle Deals</h2>
          <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">Save more!</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bundles.map(
            (bundle: {
              id: number
              name: string
              description: string
              product_ids: number[]
              original_price: number
              bundle_price: number
              savings: number
              products: { id: number; name: string; images: string[] }[]
            }) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ),
          )}
        </div>
      </div>
    </section>
  )
}
