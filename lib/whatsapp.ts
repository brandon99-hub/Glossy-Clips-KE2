// WhatsApp notification helper
export function notifyOwnerNewOrder(order: {
    referenceCode: string
    customerName: string
    phoneNumber: string
    totalAmount: number
    deliveryMethod?: string
    pickupLocation: string
}) {
    const ownerPhone = process.env.NEXT_PUBLIC_MPESA_PHONE_NUMBER || "254741991213"

    const message = `🛍️ NEW ORDER!

Ref: ${order.referenceCode}
Customer: ${order.customerName}
Phone: ${order.phoneNumber}
Amount: KES ${order.totalAmount.toLocaleString()}
Delivery: ${order.deliveryMethod === "pickup-mtaani" ? "Pickup Mtaani" : "Self Pickup"}
Location: ${order.pickupLocation}

Check admin panel to confirm payment.`

    // Auto-open WhatsApp with pre-filled message
    if (typeof window !== "undefined") {
        window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`, "_blank")
    }
}
