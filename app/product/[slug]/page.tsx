import { notFound } from "next/navigation"
import { sql, type Product } from "@/lib/db"
import { ProductDetails } from "./product-details"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const products = await sql<Product[]>`
    SELECT * FROM products 
    WHERE slug = ${slug} AND is_active = true
  `

  if (!products.length) {
    notFound()
  }

  const product = products[0]

  // Don't show secret products on regular pages
  if (product.is_secret) {
    notFound()
  }

  return <ProductDetails product={product} />
}
