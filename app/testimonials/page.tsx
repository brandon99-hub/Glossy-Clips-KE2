import { sql, type Testimonial } from "@/lib/db"
import TestimonialsPage from "./testimonials-page"

export default async function Testimonials() {
  const testimonials = await sql`
    SELECT * FROM testimonials 
    WHERE is_approved = true 
    ORDER BY created_at DESC
  ` as unknown as Testimonial[]

  return <TestimonialsPage testimonials={testimonials} />
}
