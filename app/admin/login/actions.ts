"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

interface LoginAttempt {
  count: number
  lockedUntil?: number
}

// Store login attempts in memory (in production, use Redis or database)
const loginAttempts = new Map<string, LoginAttempt>()

export async function adminLogin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Check if user is locked out
  const attempt = loginAttempts.get(username)
  if (attempt?.lockedUntil && Date.now() < attempt.lockedUntil) {
    const remainingMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / 60000)
    return {
      success: false,
      error: `Too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
    }
  }

  try {
    const users = await sql<{ id: number; password_hash: string }[]>`
      SELECT id, password_hash FROM admin_users WHERE username = ${username}
    `

    if (!users.length) {
      incrementFailedAttempts(username)
      return { success: false, error: "Invalid username or password" }
    }

    const isValid = await bcrypt.compare(password, users[0].password_hash)

    if (!isValid) {
      incrementFailedAttempts(username)
      const currentAttempt = loginAttempts.get(username)
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - (currentAttempt?.count || 0)

      if (remainingAttempts > 0) {
        return {
          success: false,
          error: `Invalid username or password. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
        }
      } else {
        return {
          success: false,
          error: "Too many failed attempts. Account locked for 15 minutes."
        }
      }
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(username)

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred. Please try again." }
  }
}

function incrementFailedAttempts(username: string) {
  const attempt = loginAttempts.get(username) || { count: 0 }
  attempt.count++

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCKOUT_DURATION
  }

  loginAttempts.set(username, attempt)
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  return { success: true }
}
