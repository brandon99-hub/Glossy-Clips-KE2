"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Clock, CheckCircle, Package, MapPin, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Order } from "@/lib/db"
import { updateOrderStatus } from "./actions"

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-600 bg-amber-50" },
  paid: { label: "Paid", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  packed: { label: "Packed", icon: Package, color: "text-blue-600 bg-blue-50" },
  collected: { label: "Collected", icon: MapPin, color: "text-muted-foreground bg-muted" },
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>("all")

  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filter === "all" || o.status === filter
    const matchesSearch =
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.reference_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone_number.includes(searchQuery) ||
      (o.secret_code && o.secret_code.toLowerCase().includes(searchQuery.toLowerCase()))

    let matchesDate = true
    if (startDate) {
      matchesDate = matchesDate && new Date(o.created_at) >= new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // End of the day
      matchesDate = matchesDate && new Date(o.created_at) <= end
    }

    return matchesStatus && matchesSearch && matchesDate
  })

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setLoading(orderId)
    await updateOrderStatus(orderId, newStatus as Order["status"])
    router.refresh()
    setLoading(null)
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
          <div className="sm:col-span-3 md:col-span-1">
            <Label className="text-sm">Search</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Customer, reference, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 sm:h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:col-span-3 md:col-span-2">
            <div>
              <Label className="text-sm">From Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 h-10 sm:h-9"
              />
            </div>
            <div>
              <Label className="text-sm">To Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 h-10 sm:h-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {["all", "pending", "paid", "packed", "collected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 active:bg-muted/90"
              }`}
          >
            {status === "all" ? "All" : statusConfig[status as keyof typeof statusConfig].label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No orders found</div>
        ) : (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon
            const nextStatus =
              order.status === "pending"
                ? "paid"
                : order.status === "paid"
                  ? "packed"
                  : order.status === "packed"
                    ? "collected"
                    : null

            return (
              <div key={order.id} className="bg-card border border-border rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-3 sm:gap-4 mb-3">
                  {/* Product Thumbnail */}
                  {order.items.length > 0 && order.items[0].image && (
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={order.items[0].image}
                        alt={order.items[0].name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono font-semibold text-sm sm:text-base">#{order.reference_code}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.secret_code && (
                          <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                            ㊙️ SECRET
                          </span>
                        )}
                        {order.has_bundle && (
                          <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                            🎁 BUNDLE
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {order.customer_name} • {order.phone_number}
                    </p>
                  </div>

                  {/* Price */}
                  <p className="font-semibold whitespace-nowrap text-sm sm:text-base">KES {order.total_amount.toLocaleString()}</p>
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  <p>Pickup: {order.pickup_location}</p>
                  <p className="text-xs mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-KE", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Items */}
                <div className="bg-muted rounded-lg p-3 mb-3">
                  <p className="text-xs text-muted-foreground mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          {item.name} x{item.quantity}
                          {item.is_bundle && <span className="text-blue-500" title="Bundle Item">🎁</span>}
                        </span>
                        <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {nextStatus && (
                  <Button
                    onClick={() => handleStatusUpdate(order.id, nextStatus)}
                    disabled={loading === order.id}
                    className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80"
                    size="sm"
                    style={{ minHeight: '44px' }}
                  >
                    {loading === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Mark as {statusConfig[nextStatus].label}</>
                    )}
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
