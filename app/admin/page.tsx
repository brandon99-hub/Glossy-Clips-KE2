import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"

export default async function AdminPage() {
  const isLoggedIn = await verifyAdminSession()

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  redirect("/admin/orders")
}
