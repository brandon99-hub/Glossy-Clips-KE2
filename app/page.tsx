import { sql, type Product, type Testimonial } from "@/lib/db"
import { HomeClient } from "./home-client"
import { BundlesSection } from "@/components/bundles-section"

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Gold Claw Clip",
    slug: "gold-claw-clip",
    description: "Elegant gold claw clip perfect for everyday glam",
    price: 450,
    category: "hair-clip",
    images: ["/gold-hair-claw-clip.jpg"],
    stock_quantity: 3, // Low stock example
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
    stock_quantity: 2, // Low stock example
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
    stock_quantity: 0, // Sold out example
    is_active: true,
    is_secret: false,
    created_at: new Date().toISOString(),
  },
]

const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    username: "@_muthoniwairimu",
    message: "Obsessed with my new clips!! The quality is amazing 💕",
    profile_image: "/african-woman-avatar.jpg",
    emoji_reactions: "💕",
    is_active: true,
    is_approved: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    username: "@nairobibabe",
    message: "Finally found a Kenyan store with Summer Fridays! Delivery was so fast 🚀",
    profile_image: "/young-woman-avatar.png",
    emoji_reactions: "🚀",
    is_active: true,
    is_approved: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    username: "@glossygirl254",
    message: "The gift card surprise made my day! Got 200 KES off my next order 🎁",
    profile_image: "/smiling-woman-avatar.png",
    emoji_reactions: "🎁",
    is_active: true,
    is_approved: true,
    created_at: new Date().toISOString(),
  },
]

export default async function HomePage() {
  let products: Product[] = fallbackProducts
  let testimonials: Testimonial[] = []
  let bundles: Array<{
    id: number
    name: string
    description: string
    bundle_price: number
    original_price: number
    savings: number
    bundle_image?: string
  }> = []

  try {
    const dbProducts = await sql`
      SELECT * FROM products 
      WHERE is_active = true AND is_secret = false 
      ORDER BY created_at DESC 
      LIMIT 6
    ` as unknown as Product[]

    if (dbProducts.length > 0) {
      products = dbProducts
    }

    const dbTestimonials = await sql`
      SELECT * FROM testimonials 
      WHERE is_active = true 
      ORDER BY created_at DESC
    ` as unknown as Testimonial[]

    if (dbTestimonials.length > 0) {
      testimonials = dbTestimonials
    }

    // Fetch active bundles for desktop hero
    const dbBundles = await sql`
      SELECT id, name, description, bundle_price, original_price, savings, bundle_image, product_ids
      FROM bundles 
      WHERE is_active = true 
      ORDER BY created_at DESC
      LIMIT 5
    `
    bundles = dbBundles as typeof bundles
  } catch {
    // Database check failed, using fallback products only
    console.log("Database connection failed or empty")
  }

  return (
    <HomeClient
      products={products}
      testimonials={testimonials}
      bundles={bundles}
      bundlesSection={<BundlesSection />}
    />
  )
}
