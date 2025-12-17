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
            // Simple & Soft Design (105mm x 148mm - A6)
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [105, 148]
            })

            const width = 105
            const height = 148

            // Soft Pink Background (Pale Pink)
            doc.setFillColor(255, 240, 245)
            doc.rect(0, 0, width, height, "F")

            // -- Logo / Brand (Small, Top Left) --
            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.setTextColor(236, 72, 153) // Pink-500
            doc.text("GLOSSYCLIPSKE", 8, 12, { align: "left" }) // Small logo text

            // -- QR Code (Center) --
            const qrSize = 60
            const centerX = width / 2
            const centerY = height / 2
            doc.addImage(code.qrCodeData, "PNG", centerX - (qrSize / 2), centerY - (qrSize / 2) - 10, qrSize, qrSize)

            // -- Message (Below QR) --
            doc.setFont("helvetica", "normal")
            doc.setFontSize(12)
            doc.setTextColor(50, 50, 50)
            doc.text(`${code.discount_percent}% OFF`, centerX, centerY + (qrSize / 2) + 5, { align: "center" })

            // -- Secret Code (Small, Minimal) --
            doc.setFont("courier", "normal")
            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text(code.code, centerX, centerY + (qrSize / 2) + 12, { align: "center" })

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
