import { sql } from "@/lib/db"
import { BundleCard } from "./bundle-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

type Bundle = {
  id: number
  name: string
  description: string
  product_ids: number[]
  original_price: number
  bundle_price: number
  savings: number
  bundle_image?: string
  is_active: boolean
  created_at: string
}

type BundleWithProducts = Bundle & {
  products: { id: number; name: string; images: string[] }[]
}

async function getBundles() {
  try {
    const bundles = await sql`
      SELECT * FROM bundles WHERE is_active = true ORDER BY created_at DESC LIMIT 5
    ` as unknown as Bundle[]

    // Get product details for each bundle
    const bundlesWithProducts = await Promise.all(
      bundles.map(async (bundle): Promise<BundleWithProducts> => {
        const products = await sql`
          SELECT id, name, images FROM products WHERE id = ANY(${bundle.product_ids})
        ` as unknown as { id: number; name: string; images: string[] }[]
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
    <section className="py-12 px-4 bg-gradient-to-br from-rose-50/50 to-amber-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Bundle Deals</h2>
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              Save more!
            </span>
          </div>
          {bundles.length >= 3 && (
            <Link
              href="/bundles#curated-bundles"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Horizontal Scrollable Carousel */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="flex-shrink-0 w-[85%] sm:w-[45%] snap-start">
                <BundleCard bundle={bundle} />
              </div>
            ))}
          </div>

          {/* Scroll hint gradient */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
