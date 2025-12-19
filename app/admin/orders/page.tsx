import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql, type Order } from "@/lib/db"
import { OrdersTable } from "./orders-table"

export default async function AdminOrdersPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_session")

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  const orders = await sql`
    SELECT o.*, 
      sc.code as secret_code,
      EXISTS(
        SELECT 1 FROM bundles b 
        WHERE b.is_active = true 
        AND b.product_ids <@ (
          SELECT array_agg((item->>'product_id')::int) 
          FROM jsonb_array_elements(o.items) AS item
        )
      ) as has_bundle
    FROM orders o
    LEFT JOIN secret_codes sc ON o.id = sc.order_id 
      AND sc.created_at < o.created_at
    ORDER BY o.created_at DESC
  ` as Order[]

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders and confirm payments</p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  )
}
