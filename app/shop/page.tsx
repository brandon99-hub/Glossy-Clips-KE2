import type React from "react"
import { sql, type Product } from "@/lib/db"
import { ProductCard } from "@/components/product-card"

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Gold Claw Clip",
    slug: "gold-claw-clip",
    description: "Elegant gold claw clip perfect for everyday glam",
    price: 450,
    category: "hair-clip",
    images: ["/gold-hair-claw-clip.jpg"],
    stock: 10,
    is_active: true,
    is_secret: false,
    created_at: new Date(),
  },
  {
    id: 2,
    name: "Pearl Hair Pins Set",
    slug: "pearl-hair-pins",
    description: "Set of 5 delicate pearl hair pins",
    price: 350,
    category: "hair-clip",
    images: ["/pearl-hair-pins-set.jpg"],
    stock: 15,
    is_active: true,
    is_secret: false,
    created_at: new Date(),
  },
  {
    id: 3,
    name: "Summer Fridays Vanilla",
    slug: "summer-fridays-vanilla",
    description: "Hydrating vanilla lip gloss",
    price: 1200,
    category: "gloss",
    images: ["/summer-fridays-vanilla-lip-gloss-pink-tube.jpg"],
    stock: 8,
    is_active: true,
    is_secret: false,
    created_at: new Date(),
  },
  {
    id: 4,
    name: "Butterfly Clips Pack",
    slug: "butterfly-clips-pack",
    description: "Pack of 6 colorful butterfly clips",
    price: 280,
    category: "hair-clip",
    images: ["/colorful-butterfly-hair-clips.jpg"],
    stock: 20,
    is_active: true,
    is_secret: false,
    created_at: new Date(),
  },
  {
    id: 5,
    name: "Summer Fridays Cherry",
    slug: "summer-fridays-cherry",
    description: "Sweet cherry tinted lip gloss",
    price: 1200,
    category: "gloss",
    images: ["/summer-fridays-cherry-lip-gloss.jpg"],
    stock: 12,
    is_active: true,
    is_secret: false,
    created_at: new Date(),
  },
  {
    id: 6,
    name: "Satin Scrunchie Set",
    slug: "satin-scrunchie-set",
    description: "Set of 3 satin scrunchies",
    price: 400,
    category: "hair-clip",
    images: ["/satin-scrunchies-pink-brown-beige.jpg"],
    stock: 25,
    is_active: true,
    is_secret: false,
    created_at: new Date(),
  },
]

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  let products: Product[] = fallbackProducts

  try {
    let dbProducts: Product[]
    if (category) {
      dbProducts = await sql<Product[]>`
        SELECT * FROM products 
        WHERE is_active = true AND is_secret = false AND category = ${category}
        ORDER BY created_at DESC
      `
    } else {
      dbProducts = await sql<Product[]>`
        SELECT * FROM products 
        WHERE is_active = true AND is_secret = false
        ORDER BY created_at DESC
      `
    }
    if (dbProducts.length > 0) {
      products = dbProducts
    } else if (category) {
      // Filter fallback products by category
      products = fallbackProducts.filter((p) => p.category === category)
    }
  } catch (error) {
    // Database not set up, use fallback and filter by category if needed
    if (category) {
      products = fallbackProducts.filter((p) => p.category === category)
    }
  }

  const categoryTitle = category === "hair-clip" ? "Hair Clips" : category === "gloss" ? "Lip Gloss" : "All Products"

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">{categoryTitle}</h1>
        <p className="text-muted-foreground mb-8">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>

        {/* Filter Tabs - Updated to hair-clip */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <FilterTab href="/shop" active={!category}>
            All
          </FilterTab>
          <FilterTab href="/shop?category=hair-clip" active={category === "hair-clip"}>
            Hair Clips
          </FilterTab>
          <FilterTab href="/shop?category=gloss" active={category === "gloss"}>
            Lip Gloss
          </FilterTab>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterTab({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {children}
    </a>
  )
}
