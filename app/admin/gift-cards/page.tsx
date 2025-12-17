import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql, type GiftCard } from "@/lib/db"

export default async function AdminGiftCardsPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_session")

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  const giftCards = await sql<(GiftCard & { order_reference?: string })[]>`
    SELECT gc.*, o.reference_code as order_reference
    FROM gift_cards gc
    LEFT JOIN orders o ON gc.order_id = o.id
    ORDER BY gc.created_at DESC
  `

  const stats = {
    total: giftCards.length,
    totalValue: giftCards.reduce((sum, gc) => sum + gc.value, 0),
    redeemed: giftCards.filter((gc) => gc.is_redeemed).length,
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gift Cards</h1>
        <p className="text-muted-foreground">Auto-generated gift cards for orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Cards</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">KES {stats.totalValue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Value</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{stats.redeemed}</p>
          <p className="text-sm text-muted-foreground">Redeemed</p>
        </div>
      </div>

      {/* Gift cards list */}
      <div className="space-y-3">
        {giftCards.map((gc) => (
          <div key={gc.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-mono font-semibold">{gc.code}</p>
              <p className="text-sm text-muted-foreground">
                Order: #{gc.order_reference || "N/A"} • {new Date(gc.created_at).toLocaleDateString("en-KE")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">KES {gc.value}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  gc.is_redeemed ? "bg-muted text-muted-foreground" : "bg-green-50 text-green-600"
                }`}
              >
                {gc.is_redeemed ? "Redeemed" : "Active"}
              </span>
            </div>
          </div>
        ))}

        {giftCards.length === 0 && <div className="text-center py-12 text-muted-foreground">No gift cards yet</div>}
      </div>
    </div>
  )
}
