import { sql, type Product, type Testimonial } from "@/lib/db"
import { HeroSection } from "@/components/hero-section"
import { CategoryGrid } from "@/components/category-grid"
import { ProductCard } from "@/components/product-card"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"
import { BundlesSection } from "@/components/bundles-section"
import { SwipeNavigation } from "@/components/swipe-navigation"

import { DesktopHero } from "@/components/desktop-hero"
import { DesktopCategoryGrid } from "@/components/desktop-category-grid"

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
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    username: "@nairobibabe",
    message: "Finally found a Kenyan store with Summer Fridays! Delivery was so fast 🚀",
    profile_image: "/young-woman-avatar.png",
    emoji_reactions: "🚀",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    username: "@glossygirl254",
    message: "The gift card surprise made my day! Got 200 KES off my next order 🎁",
    profile_image: "/smiling-woman-avatar.png",
    emoji_reactions: "🎁",
    is_active: true,
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
    <SwipeNavigation currentPage="home">
      <div>
        <div className="md:hidden">
          <HeroSection />
          <CategoryGrid />
        </div>

        <div className="hidden md:block">
          <DesktopHero bundles={bundles} />
          <DesktopCategoryGrid />
        </div>
        <div className="md:hidden">
          <BundlesSection />
        </div>

        {/* Featured Products - Mobile */}
        <section className="py-12 px-4 md:hidden">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-2">New Arrivals</h2>
            <p className="text-muted-foreground text-center mb-8">Fresh drops you need in your life</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products - Desktop */}
        <section className="hidden md:block py-20 px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">New Arrivals</h2>
              <p className="text-lg text-muted-foreground">Fresh drops you need in your life</p>
            </div>
            <div className="grid grid-cols-4 gap-8 max-w-7xl mx-auto">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="py-12 px-4 bg-muted/30">
            <div className="container mx-auto">
              <h2 className="text-2xl font-bold text-center mb-2">The Love</h2>
              <p className="text-muted-foreground text-center mb-4">What our girlies are saying</p>
              <TestimonialsCarousel testimonials={testimonials} />
            </div>
          </section>
        )}

        {/* Gift Card Teaser */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-md text-center">
            <div className="bg-gradient-to-br from-rose-100 to-amber-50 rounded-3xl p-8">
              <span className="text-4xl mb-4 block">🎁</span>
              <h2 className="text-xl font-bold mb-2">Free Gift Card</h2>
              <p className="text-muted-foreground text-sm">
                Every order comes with a surprise gift card reveal. Scratch to see your reward!
              </p>
            </div>
          </div>
        </section>
      </div>
    </SwipeNavigation>
  )
}
