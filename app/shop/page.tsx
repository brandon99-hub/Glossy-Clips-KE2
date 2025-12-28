import { sql, type Product } from "@/lib/db"
import { SwipeNavigation } from "@/components/swipe-navigation"
import { ShopClient } from "./shop-client"

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

export default async function ShopPage() {
  let products: Product[] = fallbackProducts
  let maxPrice = 5000

  try {
    // Fetch all active products
    products = (await sql`
      SELECT * FROM products 
      WHERE is_active = true AND is_secret = false
      ORDER BY created_at DESC
    `) as unknown as Product[]

    // Calculate max price for filter
    if (products.length > 0) {
      maxPrice = Math.max(...products.map((p) => p.price))
      // Round up to nearest 100
      maxPrice = Math.ceil(maxPrice / 100) * 100
    }
  } catch (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <SwipeNavigation currentPage="shop">
      <ShopClient initialProducts={products} maxPrice={maxPrice} />
    </SwipeNavigation>
  )
}
