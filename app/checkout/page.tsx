"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Copy, Check, Loader2, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/lib/cart-context"
import { createOrder } from "./actions"
import type { PickupMtaaniLocation } from "@/lib/db"

const MPESA_PHONE = process.env.NEXT_PUBLIC_MPESA_PHONE_NUMBER || "254741991213"
const MPESA_BUSINESS_NAME = process.env.NEXT_PUBLIC_MPESA_BUSINESS_NAME || "GlossyClipsKE"

export default function CheckoutPage({ searchParams }: { searchParams: Promise<{ delivery?: string }> }) {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<PickupMtaaniLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<PickupMtaaniLocation | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<"self-pickup" | "pickup-mtaani">("self-pickup")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
  })

  // Get delivery method from URL params
  // Get delivery method from URL params or localStorage
  useEffect(() => {
    const saved = localStorage.getItem("deliveryMethod")
    if (saved === "pickup-mtaani") {
      setDeliveryMethod("pickup-mtaani")
    }

    async function getParams() {
      const params = await searchParams
      if (params.delivery) {
        setDeliveryMethod(params.delivery as "self-pickup" | "pickup-mtaani")
      }
    }
    getParams()
  }, [searchParams])

  // Fetch Pickup Mtaani locations
  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch("/api/pickup-locations")
        if (response.ok) {
          const data = await response.json()
          setLocations(data.locations || [])
        }
      } catch (error) {
        console.error("Error fetching locations:", error)
      }
    }
    fetchLocations()
  }, [])

  if (items.length === 0) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-md">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to checkout</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/shop">Browse Shop</Link>
          </Button>
        </div>
      </div>
    )
  }

  const deliveryFee = deliveryMethod === "pickup-mtaani" && selectedLocation ? selectedLocation.delivery_fee : 0
  const finalTotal = Number(totalAmount) + Number(deliveryFee)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Format phone number - handle various formats
      let formattedPhone = formData.phone.replace(/\s/g, "").replace(/\+/g, "")

      // If starts with 254, convert to 0
      if (formattedPhone.startsWith("254")) {
        formattedPhone = "0" + formattedPhone.substring(3)
      }

      // Ensure it starts with 0
      if (!formattedPhone.startsWith("0")) {
        formattedPhone = "0" + formattedPhone
      }

      const result = await createOrder({
        customerName: formData.name,
        phoneNumber: formattedPhone,
        pickupLocation: deliveryMethod === "self-pickup" ? formData.location : selectedLocation?.name || "",
        deliveryMethod: deliveryMethod,
        deliveryFee: Number(deliveryFee),
        pickupMtaaniLocationId: selectedLocation?.id,
        items: items.map(item => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
        totalAmount: Number(finalTotal),
      })

      if (result.success && result.referenceCode) {
        // Notify owner via WhatsApp
        const { notifyOwnerNewOrder } = await import("@/lib/whatsapp")
        notifyOwnerNewOrder({
          referenceCode: result.referenceCode,
          customerName: formData.name,
          phoneNumber: formattedPhone,
          totalAmount: Number(finalTotal),
          deliveryMethod: deliveryMethod,
          pickupLocation: deliveryMethod === "self-pickup" ? formData.location : selectedLocation?.name || "",
        })

        clearCart()
        router.push(`/success/${result.referenceCode}`)
      } else {
        toast.error(result.error || "Failed to create order. Please try again.")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWhatsApp = () => {
    window.open(`https://wa.me/${MPESA_PHONE}?text=Hi, I need help with my order`, "_blank")
  }

  return (
    <div className="py-4 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back button */}
        <Link
          href="/cart"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to cart
        </Link>

        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {/* Payment Info Card - Always Visible */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">💰 Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Send payment to:</p>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <p className="font-bold text-lg">{MPESA_PHONE}</p>
                  <p className="text-sm text-muted-foreground">{MPESA_BUSINESS_NAME}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(MPESA_PHONE)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Alert>
                <AlertDescription className="text-sm">
                  After sending payment, fill in your details below. We'll confirm your payment and contact you.
                </AlertDescription>
              </Alert>

              {/* WhatsApp Support Hint */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span>
                  Need help?{" "}
                  <button onClick={openWhatsApp} className="text-green-600 hover:underline font-medium">
                    Message us on WhatsApp
                  </button>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Wanjiku"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (MPESA)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              {/* Conditional Location Input based on cart selection */}
              {deliveryMethod === "self-pickup" ? (
                <div>
                  <Label htmlFor="location">Meeting Point</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Westlands, CBD, or specific location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">We'll send you pickup details after payment</p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="pickup-location">Pickup Mtaani Location</Label>
                  <Select
                    onValueChange={(value) => {
                      const loc = locations.find((l) => l.id === parseInt(value))
                      setSelectedLocation(loc || null)
                    }}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id.toString()}>
                          {loc.name} - {loc.area} (KES {loc.delivery_fee})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Delivery fee: KES {selectedLocation?.delivery_fee || 0}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x{item.quantity}
                    </span>
                    <span>KES {(Number(item.price) * Number(item.quantity)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>KES {deliveryFee.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">KES {finalTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing order...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
