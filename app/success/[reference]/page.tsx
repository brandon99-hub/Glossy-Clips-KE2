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
    const message = `Hi GlossyClipsKE! 👋\n\nI'd like to place this order:\n\n📦 ORDER ${reference}\n\nPlease confirm my exact total and send payment details! 🙏`
    window.open(`https://wa.me/${MPESA_PHONE}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Sent!</h1>
          <p className="text-muted-foreground italic">Your reference code is: <span className="font-mono font-bold text-foreground">{reference}</span></p>
        </div>

        {/* Gift Card Reveal Modal */}
        <GiftCardRevealModal />

        {/* Account Creation Prompt */}
        <AccountCreationPrompt referenceCode={reference} />

        {/* Payment Instructions Card */}
        <Card className="mb-6 bg-blue-50/50 border-blue-100 border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">⏳ Awaiting Confirmation</CardTitle>
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

            <Alert className="bg-white border-blue-200">
              <AlertDescription className="text-sm font-medium text-blue-800">
                We'll send you the exact total via WhatsApp within 5-10 minutes. Once confirmed, you can proceed with the M-Pesa payment below.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Backup WhatsApp Link */}
        <div className="text-center mb-8">
          <button
            onClick={openWhatsApp}
            className="text-xs font-bold text-green-600 hover:text-green-700 underline flex items-center justify-center gap-1.5 mx-auto"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Didn't open WhatsApp? Tap here to try again
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button variant="outline" asChild className="w-full rounded-xl">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full rounded-xl">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {/* Next Steps Guide */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-4 text-muted-foreground font-medium">
              <li className="flex gap-4">
                <span className="bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary shrink-0">1</span>
                <span>We've sent your order summary to WhatsApp. Please **wait for us to reply** with your exact total.</span>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary shrink-0">2</span>
                <span>Once confirmed, send the payment using the **M-Pesa details** shown above.</span>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary shrink-0">3</span>
                <span>After payment, we'll verify and coordinate your **delivery timing**! 💄✨</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
