import type React from "react"
import { cookies, headers } from "next/headers"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_session")

  // Get current pathname to check if we're on auth pages
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""

  // Don't show sidebar on login, forgot-password, or reset-password pages
  const isAuthPage = pathname.includes("/login") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password")

  const showSidebar = isLoggedIn && !isAuthPage

  return (
    <div className="min-h-screen flex">
      {showSidebar && <AdminSidebar />}
      <main className={`flex-1 ${showSidebar ? "md:ml-64" : ""}`}>{children}</main>
    </div>
  )
}
