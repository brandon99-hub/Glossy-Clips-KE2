"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
      o.phone_number.includes(searchQuery)

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
      <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Customer, reference, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:col-span-2">
            <div>
              <Label>From Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>To Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "pending", "paid", "packed", "collected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === status
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
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
              <div key={order.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold">#{order.reference_code}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_name} • {order.phone_number}
                    </p>
                  </div>
                  <p className="font-semibold">KES {order.total_amount.toLocaleString()}</p>
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
                        <span>
                          {item.name} x{item.quantity}
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
                    className="w-full bg-primary hover:bg-primary/90"
                    size="sm"
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
