import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql, type Order } from "@/lib/db"
import { OrdersTable } from "./orders-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { verifyAdminSession } from "@/lib/admin-auth"

export default async function AdminOrdersPage() {
  const isLoggedIn = await verifyAdminSession()

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
      <AdminPageHeader
        title="Orders"
        description="Manage customer orders, fulfill shipments, and confirm payments."
      />
      <OrdersTable orders={orders} />
    </div>
  )
}
