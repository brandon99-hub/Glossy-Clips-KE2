"use server"

import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function updateAdminEmail(email: string) {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get("admin_session")

    if (!isLoggedIn) {
        return { success: false, error: "Unauthorized" }
    }

    if (!email || !email.includes("@")) {
        return { success: false, error: "Invalid email address" }
    }

    try {
        await sql`
      UPDATE admin_users 
      SET email = ${email}
      WHERE username = 'admin'
    `

        return { success: true }
    } catch (error) {
        console.error("Error updating email:", error)
        return { success: false, error: "Failed to update email" }
    }
}

export async function updateAdminPassword(currentPassword: string, newPassword: string) {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get("admin_session")

    if (!isLoggedIn) {
        return { success: false, error: "Unauthorized" }
    }

    if (newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" }
    }

    try {
        // Verify current password
        const users = await sql`
      SELECT password_hash FROM admin_users WHERE username = 'admin'
    `

        if (!users.length) {
            return { success: false, error: "User not found" }
        }

        const isValid = await bcrypt.compare(currentPassword, users[0].password_hash)

        if (!isValid) {
            return { success: false, error: "Current password is incorrect" }
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await sql`
      UPDATE admin_users 
      SET password_hash = ${hashedPassword}
      WHERE username = 'admin'
    `

        return { success: true }
    } catch (error) {
        console.error("Error updating password:", error)
        return { success: false, error: "Failed to update password" }
    }
}

export async function getAdminSettings() {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get("admin_session")

    if (!isLoggedIn) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const users = await sql`
      SELECT username, email FROM admin_users WHERE username = 'admin'
    `

        if (!users.length) {
            return { success: false, error: "User not found" }
        }

        return { success: true, data: users[0] }
    } catch (error) {
        console.error("Error fetching settings:", error)
        return { success: false, error: "Failed to fetch settings" }
    }
}
