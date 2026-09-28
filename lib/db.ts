import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

// Re-export all domain types from centralized types directory for backwards-compatibility
export * from "@/types/db"
