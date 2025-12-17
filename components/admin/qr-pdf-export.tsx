"use client"

import { Button } from "@/components/ui/button"
import { Download, Check } from "lucide-react"
import { jsPDF } from "jspdf"
import type { SecretCode } from "@/lib/db"
import { markAsExported } from "@/app/admin/qr-codes/actions"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface QRCodePDFExporterProps {
    code: SecretCode & {
        order_reference?: string
        secretUrl: string
        qrCodeData: string | null
    }
}

export function QRCodePDFExporter({ code }: QRCodePDFExporterProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        if (!code.qrCodeData) return
        setLoading(true)

        try {
            // Premium Card Design (105mm x 148mm - A6)
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [105, 148]
            })

            const width = 105
            const height = 148
            const centerX = width / 2

            // -- Background --
            doc.setFillColor(255, 255, 255)
            doc.rect(0, 0, width, height, "F")

            // Border
            doc.setDrawColor(236, 72, 153) // Pink-500
            doc.setLineWidth(1)
            doc.roundedRect(5, 5, width - 10, height - 10, 3, 3, "S")

            // -- Header --
            // Pink Header Box
            doc.setFillColor(253, 242, 248) // Pink-50
            doc.roundedRect(6, 6, width - 12, 35, 2, 2, "F")

            doc.setFont("helvetica", "bold")
            doc.setFontSize(16)
            doc.setTextColor(236, 72, 153) // Pink branding
            doc.text("GLOSSYCLIPSKE", centerX, 20, { align: "center" })

            doc.setFont("helvetica", "normal")
            doc.setFontSize(10)
            doc.setTextColor(80, 80, 80)
            doc.text("A Little Secret Just For You \u2764", centerX, 30, { align: "center" }) // Heart

            // -- Discount Highlight --
            doc.setFont("helvetica", "bold")
            doc.setFontSize(32)
            doc.setTextColor(0, 0, 0)
            doc.text(`${code.discount_percent}% OFF`, centerX, 55, { align: "center" })

            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text("ON YOUR NEXT ORDER", centerX, 62, { align: "center" })

            // -- QR Code --
            const qrSize = 55
            doc.addImage(code.qrCodeData, "PNG", centerX - (qrSize / 2), 70, qrSize, qrSize)

            // -- Code Box --
            doc.setFillColor(245, 245, 245)
            doc.roundedRect(centerX - 30, 128, 60, 12, 1, 1, "F")

            doc.setFont("courier", "bold") // Monospace for code
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text(code.code, centerX, 136, { align: "center" })

            // -- Footer (Dates & Order) --
            doc.setFont("helvetica", "normal")
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)

            let footerY = 110 // Moved up slightly if needed, but plotting below code
            // We'll put order ref above the code box maybe? Or below at very bottom

            // Re-positioning Footer info
            const bottomY = 70 + qrSize + 5
            if (code.order_reference) {
                doc.text(`Linked to Order #${code.order_reference}`, centerX, 126, { align: "center" })
            }

            // Expiry at very bottom
            if (code.expires_at) {
                doc.text(`Valid until ${new Date(code.expires_at).toLocaleDateString()}`, centerX, height - 10, { align: "center" })
            }

            doc.save(`QR-${code.code}.pdf`)

            // Mark as exported in DB
            await markAsExported(code.id)
        } catch (e) {
            console.error("Export failed", e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleExport}
            variant={code.is_exported ? "outline" : "default"}
            size="sm"
            disabled={loading || !code.qrCodeData}
            className={cn("gap-2 w-full sm:w-auto", code.is_exported && "text-green-600 border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100")}
        >
            {code.is_exported ? (
                <>
                    <Check className="w-3 h-3" /> Exported
                </>
            ) : (
                <>
                    <Download className="w-3 h-3" /> Export PDF
                </>
            )}
        </Button>
    )
}
