import { sql, type Testimonial } from "@/lib/db"
import TestimonialsPage from "./testimonials-page"

export default async function Testimonials() {
  const testimonials = await sql<Testimonial[]>`
    SELECT * FROM testimonials 
    WHERE is_active = true 
    ORDER BY created_at DESC
  `

  return <TestimonialsPage testimonials={testimonials} />
}
