"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function adminLogin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  try {
    const users = await sql<{ id: number; password_hash: string }[]>`
      SELECT id, password_hash FROM admin_users WHERE username = ${username}
    `

    if (!users.length) {
      return { success: false, error: "Invalid username or password" }
    }

    const isValid = await bcrypt.compare(password, users[0].password_hash)

    if (!isValid) {
      return { success: false, error: "Invalid username or password" }
    }

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
    return { success: false, error: "An error occurred" }
  }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  return { success: true }
}
