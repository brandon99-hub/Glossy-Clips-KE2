import type React from "react"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_session")

  // Don't apply layout to login page
  const isLoginPage = false // We'll check this differently

  return (
    <div className="min-h-screen flex">
      {isLoggedIn && <AdminSidebar />}
      <main className={`flex-1 ${isLoggedIn ? "md:ml-64" : ""}`}>{children}</main>
    </div>
  )
}
