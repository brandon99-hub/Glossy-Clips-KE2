import type React from "react"
import { sql, type Product, type Category } from "@/lib/db"
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
    stock_quantity: 10,
    is_active: true,
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Pearl Hair Pins Set",
    slug: "pearl-hair-pins",
    description: "Set of 5 delicate pearl hair pins",
    price: 350,
    category: "hair-clip",
    images: ["/pearl-hair-pins-set.jpg"],
    stock_quantity: 15,
    is_active: true,
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Summer Fridays Vanilla",
    slug: "summer-fridays-vanilla",
    description: "Hydrating vanilla lip gloss",
    price: 1200,
    category: "gloss",
    images: ["/summer-fridays-vanilla-lip-gloss-pink-tube.jpg"],
    stock_quantity: 8,
    is_active: true,
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Butterfly Clips Pack",
    slug: "butterfly-clips-pack",
    description: "Pack of 6 colorful butterfly clips",
    price: 280,
    category: "hair-clip",
    images: ["/colorful-butterfly-hair-clips.jpg"],
    stock_quantity: 20,
    is_active: true,
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Summer Fridays Cherry",
    slug: "summer-fridays-cherry",
    description: "Sweet cherry tinted lip gloss",
    price: 1200,
    category: "gloss",
    images: ["/summer-fridays-cherry-lip-gloss.jpg"],
    stock_quantity: 12,
    is_active: true,
    is_secret: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Satin Scrunchie Set",
    slug: "satin-scrunchie-set",
    description: "Set of 3 satin scrunchies",
    price: 400,
    category: "hair-clip",
    images: ["/satin-scrunchies-pink-brown-beige.jpg"],
    stock_quantity: 25,
    is_active: true,
    is_secret: false,
    created_at: new Date().toISOString(),
  },
]

import { SearchInput } from "@/components/search-input"
import { SwipeNavigation } from "@/components/swipe-navigation"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const { category, search } = await searchParams

  let products: Product[] = fallbackProducts
  let categories: Category[] = []

  // Fetch categories
  try {
    categories = await sql`
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY display_order ASC
    ` as Category[]
  } catch (error) {
    console.error('Error fetching categories:', error)
  }

  try {
    if (search) {
      // Use PostgreSQL Full-Text Search with ranking
      // 'A' weight for name, 'B' weight for description
      const searchTerms = search.trim().split(/\s+/).join(" & ")
      products = await sql`
        SELECT *, 
          ts_rank_cd(
            setweight(to_tsvector('english', name), 'A') || 
            setweight(to_tsvector('english', COALESCE(description, '')), 'B'),
            to_tsquery('english', ${searchTerms})
          ) AS rank
        FROM products 
        WHERE is_active = true 
        AND is_secret = false 
        AND (
          setweight(to_tsvector('english', name), 'A') || 
          setweight(to_tsvector('english', COALESCE(description, '')), 'B')
        ) @@ to_tsquery('english', ${searchTerms})
        ORDER BY rank DESC, created_at DESC
      ` as unknown as Product[]
    } else if (category) {
      products = await sql`
        SELECT * FROM products 
        WHERE is_active = true AND is_secret = false AND category = ${category}
        ORDER BY created_at DESC
      ` as unknown as Product[]
    } else {
      products = await sql`
        SELECT * FROM products 
        WHERE is_active = true AND is_secret = false
        ORDER BY created_at DESC
      ` as unknown as Product[]
    }
  } catch (error) {
    // Fallback filtering
    if (search) {
      products = fallbackProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      )
    } else if (category) {
      products = fallbackProducts.filter((p) => p.category === category)
    }
  }

  // Get category name for title
  const categoryName = categories.find(c => c.slug === category)?.name
  const title = search ? `Search: "${search}"` : (categoryName || "All Products")

  return (
    <SwipeNavigation currentPage="shop">
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">{title}</h1>
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
            </div>
            <div className="w-full md:w-72">
              <SearchInput />
            </div>
          </div>

          {/* Dynamic Filter Tabs */}
          {!search && categories.length > 0 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              <FilterTab href="/shop" active={!category}>
                All
              </FilterTab>
              {categories.map(cat => (
                <FilterTab
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  active={category === cat.slug}
                >
                  {cat.name}
                </FilterTab>
              ))}
            </div>
          )}

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
    </SwipeNavigation>
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
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
    >
      {children}
    </a>
  )
}
