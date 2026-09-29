import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

// Raw SQL client (for 100% backwards-compatibility across existing 70+ query call sites)
export const sql = neon(process.env.DATABASE_URL!)

// Type-safe Drizzle ORM client
export const db = drizzle(sql, { schema })

// Re-export all domain types and Drizzle schema
export * from "@/types/db"
export { schema }
