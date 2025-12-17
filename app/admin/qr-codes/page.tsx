import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql, type SecretCode } from "@/lib/db"

export default async function AdminQRCodesPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_session")

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  const secretCodes = await sql<(SecretCode & { order_reference?: string })[]>`
    SELECT sc.*, o.reference_code as order_reference
    FROM secret_codes sc
    LEFT JOIN orders o ON sc.order_id = o.id
    ORDER BY sc.created_at DESC
  `

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Secret QR Codes</h1>
        <p className="text-muted-foreground">QR codes to include in order packages</p>
      </div>

      {/* QR codes list */}
      <div className="space-y-3">
        {secretCodes.map((sc) => {
          const isExpired = sc.expires_at && new Date(sc.expires_at) < new Date()
          const secretUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/secret/${sc.code}`

          return (
            <div key={sc.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm break-all">{secretUrl}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order: #{sc.order_reference || "N/A"} • {sc.discount_percent}% off
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {sc.expires_at ? new Date(sc.expires_at).toLocaleDateString("en-KE") : "Never"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      sc.is_used
                        ? "bg-muted text-muted-foreground"
                        : isExpired
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                    }`}
                  >
                    {sc.is_used ? "Used" : isExpired ? "Expired" : "Active"}
                  </span>
                </div>
              </div>

              {/* QR Code placeholder - in production, generate actual QR */}
              <div className="mt-3 p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Generate QR for: /secret/{sc.code}</p>
              </div>
            </div>
          )
        })}

        {secretCodes.length === 0 && <div className="text-center py-12 text-muted-foreground">No QR codes yet</div>}
      </div>
    </div>
  )
}
