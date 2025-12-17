import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_session")

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  redirect("/admin/orders")
}
