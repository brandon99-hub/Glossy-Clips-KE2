"use server"

import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth"

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export async function adminLogin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { success: false, error: "Username and password are required" }
  }

  // Enforce minimum field lengths to reject obviously bad inputs fast
  if (username.length < 3 || password.length < 6) {
    return { success: false, error: "Invalid username or password" }
  }

  try {
    // Check DB-persisted login attempts (works on serverless / multi-instance)
    const attempts = await sql`
      SELECT attempt_count, locked_until
      FROM admin_login_attempts
      WHERE identifier = ${username}
    `

    if (attempts.length > 0) {
      const { attempt_count, locked_until } = attempts[0]
      if (locked_until && new Date(locked_until) > new Date()) {
        const remainingMinutes = Math.ceil(
          (new Date(locked_until).getTime() - Date.now()) / 60000
        )
        return {
          success: false,
          error: `Too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}.`,
        }
      }
    }

    // Fetch admin user
    const users = (await sql`
      SELECT id, password_hash FROM admin_users WHERE username = ${username}
    `) as { id: number; password_hash: string }[]

    if (!users.length) {
      await incrementFailedAttempts(username)
      return { success: false, error: "Invalid username or password" }
    }

    const isValid = await bcrypt.compare(password, users[0].password_hash)

    if (!isValid) {
      const remainingAttempts = await incrementFailedAttempts(username)
      if (remainingAttempts > 0) {
        return {
          success: false,
          error: `Invalid username or password. ${remainingAttempts} attempt${remainingAttempts > 1 ? "s" : ""} remaining.`,
        }
      } else {
        return {
          success: false,
          error: "Too many failed attempts. Account locked for 15 minutes.",
        }
      }
    }

    // Clear failed attempts on successful login
    await sql`
      DELETE FROM admin_login_attempts WHERE identifier = ${username}
    `

    // Set signed session cookie (replaces the old admin_session="true")
    await createAdminSession()

    return { success: true }
  } catch (error) {
    console.error("Admin login error:", error)
    return { success: false, error: "An error occurred. Please try again." }
  }
}

async function incrementFailedAttempts(username: string): Promise<number> {
  try {
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()

    await sql`
      INSERT INTO admin_login_attempts (identifier, attempt_count, last_attempt, locked_until)
      VALUES (${username}, 1, NOW(), NULL)
      ON CONFLICT (identifier) DO UPDATE
        SET attempt_count = admin_login_attempts.attempt_count + 1,
            last_attempt = NOW(),
            locked_until = CASE
              WHEN admin_login_attempts.attempt_count + 1 >= ${MAX_LOGIN_ATTEMPTS}
              THEN ${lockedUntil}
              ELSE NULL
            END
    `

    const result = await sql`
      SELECT attempt_count FROM admin_login_attempts WHERE identifier = ${username}
    `

    const count = result[0]?.attempt_count || MAX_LOGIN_ATTEMPTS
    return Math.max(0, MAX_LOGIN_ATTEMPTS - count)
  } catch (e) {
    console.error("Error tracking login attempt:", e)
    return 0
  }
}

export async function adminLogout() {
  await destroyAdminSession()
  return { success: true }
}

