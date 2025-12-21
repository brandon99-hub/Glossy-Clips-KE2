"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Copy, Check, MessageCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GiftCardRevealModal } from "@/components/gift-card-reveal"
import { AccountCreationPrompt } from "@/components/account-creation-prompt"

const MPESA_PHONE = process.env.NEXT_PUBLIC_MPESA_PHONE_NUMBER || "254741991213"
const MPESA_BUSINESS_NAME = process.env.NEXT_PUBLIC_MPESA_BUSINESS_NAME || "GlossyClipsKE"

export default function SuccessPage() {
  const params = useParams()
  const reference = params.reference as string
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)

  const copyToClipboard = (text: string, type: "phone" | "ref") => {
    navigator.clipboard.writeText(text)
    if (type === "phone") {
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    } else {
      setCopiedRef(true)
      setTimeout(() => setCopiedRef(false), 2000)
    }
  }

  const openWhatsApp = () => {
    const message = `Hi, I just placed order ${reference}. Please confirm when you receive payment.`
    window.open(`https://wa.me/${MPESA_PHONE}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground">Reference Code: <span className="font-mono font-bold text-foreground">{reference}</span></p>
        </div>

        {/* Gift Card Reveal Modal */}
        <GiftCardRevealModal />

        {/* Account Creation Prompt */}
        <AccountCreationPrompt referenceCode={reference} />

        {/* Payment Instructions Card */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">💰 Next Steps - Send Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">1. Send payment via MPESA to:</p>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <p className="font-bold text-lg">{MPESA_PHONE}</p>
                  <p className="text-sm text-muted-foreground">{MPESA_BUSINESS_NAME}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(MPESA_PHONE, "phone")}
                >
                  {copiedPhone ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">2. Use this reference code:</p>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                <p className="font-mono font-bold text-lg">{reference}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(reference, "ref")}
                >
                  {copiedRef ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                We'll confirm your payment and contact you with pickup details within a few hours.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* WhatsApp Support Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Questions or Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Message us on WhatsApp with your reference code for instant support and payment confirmation.
            </p>
            <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp Us
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {/* Order Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-2 text-muted-foreground">
              <li>1. Send payment using the details above</li>
              <li>2. We'll confirm your payment (usually within 1-2 hours)</li>
              <li>3. You'll receive pickup/delivery details via SMS or WhatsApp</li>
              <li>4. Collect your order and enjoy! 💄✨</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
