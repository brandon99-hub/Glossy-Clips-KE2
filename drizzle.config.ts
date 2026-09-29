import { defineConfig } from "drizzle-kit"
import fs from "fs"
import path from "path"

let databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf8")
    const match = envContent.match(/DATABASE_URL=(.+)/)
    if (match) {
      databaseUrl = match[1].trim()
      if (
        (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) ||
        (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"))
      ) {
        databaseUrl = databaseUrl.slice(1, -1)
      }
    }
  } catch {
    // env file read error fallback
  }
}

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl || "",
  },
})
