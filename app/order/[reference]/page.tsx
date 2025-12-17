import { notFound, redirect } from "next/navigation"
import { sql, type Order, type GiftCard } from "@/lib/db"
import { OrderStatus } from "./order-status"

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  const { reference } = await params

  const orders = await sql<Order[]>`
    SELECT * FROM orders 
    WHERE reference_code = ${reference}
  `

  if (!orders.length) {
    notFound()
  }

  const order = orders[0]

  // If payment confirmed and no gift card, redirect to success
  if (order.mpesa_confirmed && order.gift_card_id) {
    const giftCards = await sql<GiftCard[]>`
      SELECT * FROM gift_cards WHERE id = ${order.gift_card_id}
    `
    if (giftCards.length) {
      redirect(`/success/${reference}`)
    }
  }

  return <OrderStatus order={order} />
}
