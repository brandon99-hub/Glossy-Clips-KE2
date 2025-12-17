import { sql, type SecretCode } from "@/lib/db"
import QRCode from "qrcode"
import { QRCodePDFExporter } from "@/components/admin/qr-pdf-export"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminQRCodesPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_session")

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  const secretCodes = (await sql`
    SELECT sc.*, o.reference_code as order_reference
    FROM secret_codes sc
    LEFT JOIN orders o ON sc.order_id = o.id
    ORDER BY sc.created_at DESC
  `) as (SecretCode & { order_reference?: string })[]

  // Generate QR codes
  const codesWithQr = await Promise.all(
    secretCodes.map(async (sc) => {
      const secretUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/secret/${sc.code}`
      try {
        const qrCodeData = await QRCode.toDataURL(secretUrl)
        return { ...sc, secretUrl, qrCodeData }
      } catch (err) {
        console.error("QR Gen Error:", err)
        return { ...sc, secretUrl, qrCodeData: null }
      }
    }),
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Secret QR Codes</h1>
        <p className="text-muted-foreground">QR codes to include in order packages</p>
      </div>

      <div className="space-y-3">
        {codesWithQr.map((sc) => {
          const isExpired = sc.expires_at && new Date(sc.expires_at) < new Date()

          return (
            <div key={sc.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">

                  <p className="text-sm text-muted-foreground mt-1">
                    Order: <span className="font-medium text-foreground">#{sc.order_reference || "N/A"}</span> • {sc.discount_percent}% off
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(sc.created_at).toLocaleDateString("en-KE")} • Expires: {sc.expires_at ? new Date(sc.expires_at).toLocaleDateString("en-KE") : "Never"}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                  <div className="flex justify-between sm:justify-end items-center w-full gap-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${sc.is_used
                        ? "bg-muted text-muted-foreground"
                        : isExpired
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                        }`}
                    >
                      {sc.is_used ? "Used" : isExpired ? "Expired" : "Active"}
                    </span>
                  </div>
                  <QRCodePDFExporter code={sc} />
                </div>
              </div>

              {/* Generated QR Code Preview (Optional, keep small) */}
              <div className="mt-4 flex flex-col items-center sm:items-start">
                {sc.qrCodeData && (
                  <div className="p-2 bg-white border rounded w-fit">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sc.qrCodeData} alt="QR" className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {secretCodes.length === 0 && <div className="text-center py-12 text-muted-foreground">No QR codes yet</div>}
      </div>
    </div>
  )
}
