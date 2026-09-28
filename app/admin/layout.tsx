import type React from "react"
import { headers } from "next/headers"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { verifyAdminSession } from "@/lib/admin-auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = await verifyAdminSession()

  // Get current pathname to check if we're on auth pages
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""

  // Don't show sidebar on login, forgot-password, or reset-password pages
  const isAuthPage = pathname.includes("/login") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password")

  const showChrome = isLoggedIn && !isAuthPage

  return (
    <div className="min-h-screen flex bg-background">
      {showChrome && <AdminSidebar />}
      <div className={`flex-1 flex flex-col min-w-0 ${showChrome ? "md:ml-64" : ""}`}>
        {showChrome && <AdminHeader />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
