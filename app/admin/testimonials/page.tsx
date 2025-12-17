import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql, type Testimonial } from "@/lib/db"
import { TestimonialsManager } from "./testimonials-manager"

export default async function AdminTestimonialsPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_session")

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  const testimonials = await sql<Testimonial[]>`
    SELECT * FROM testimonials 
    ORDER BY created_at DESC
  `

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <p className="text-muted-foreground">Manage customer testimonials from IG DMs</p>
      </div>

      <TestimonialsManager testimonials={testimonials} />
    </div>
  )
}
