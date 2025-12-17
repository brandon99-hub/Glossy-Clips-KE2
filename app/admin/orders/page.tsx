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

  const orders = await sql<Order[]>`
    SELECT * FROM orders 
    ORDER BY created_at DESC
  `

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
