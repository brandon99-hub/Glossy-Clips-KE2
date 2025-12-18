import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export type Product = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  category: string
  images: string[]
  is_secret: boolean
  is_active: boolean
  stock_quantity?: number
  low_stock_threshold?: number
  notify_on_low_stock?: boolean
  average_rating?: number
  review_count?: number
  wishlist_count?: number
  created_at: string
}

export type Order = {
  id: number
  reference_code: string
  customer_name: string
  phone_number: string
  pickup_location: string
  items: CartItem[]
  total_amount: number
  status: "pending" | "paid" | "packed" | "collected"
  mpesa_confirmed: boolean
  gift_card_id: number | null
  delivery_method?: "pickup" | "pickup_mtaani"
  delivery_fee?: number
  pickup_mtaani_location?: string | null
  created_at: string
  updated_at: string
}

export type GiftCard = {
  id: number
  code: string
  value: number
  order_id: number | null
  is_redeemed: boolean
  created_at: string
}

export type Testimonial = {
  id: number
  username: string
  profile_image: string
  message: string
  emoji_reactions: string
  is_active: boolean
  created_at: string
}

export type SecretCode = {
  id: number
  code: string
  order_id: number | null
  discount_percent: number
  is_used: boolean
  is_scanned: boolean
  is_exported?: boolean
  scanned_at: string | null
  used_at: string | null
  expires_at: string | null
  created_at: string
}

export type CartItem = {
  product_id: number
  name: string
  quantity: number
  price: number
  image: string
}

export type Bundle = {
  id: number
  name: string
  description: string
  product_ids: number[]
  original_price: number
  bundle_price: number
  savings: number
  image: string | null
  is_active: boolean
  created_at: string
}

export type ProductReview = {
  id: number
  product_id: number
  customer_name: string
  rating: number
  review_text: string | null
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
}

export type WishlistItem = {
  id: number
  session_id: string | null
  customer_id: number | null
  product_id: number
  created_at: string
}

export type InventoryAlert = {
  id: number
  product_id: number
  alert_type: "low_stock" | "out_of_stock"
  previous_quantity: number | null
  current_quantity: number | null
  is_resolved: boolean
  resolved_at: string | null
  created_at: string
}

export type PickupMtaaniLocation = {
  id: number
  name: string
  area: string
  address: string | null
  delivery_fee: number
  is_active: boolean
  created_at: string
}

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  display_order: number
  is_active: boolean
  created_at: string
}



