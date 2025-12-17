"use server"

import { sql } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get("email") as string

    if (!email) {
        return { success: false, error: "Email is required" }
    }

    try {
        // Find user by email
        const users = await sql`
      SELECT id, email FROM admin_users WHERE email = ${email}
    `

        // Always return success to prevent email enumeration
        if (!users.length) {
            return { success: true, message: "If an account exists with that email, you will receive a password reset link." }
        }

        // Generate secure random token
        const token = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

        // Store token in database
        await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${users[0].id}, ${token}, ${expiresAt})
    `

        // Send reset email
        const emailResult = await sendPasswordResetEmail(email, token)

        if (!emailResult.success) {
            return { success: false, error: "Failed to send reset email. Please try again." }
        }

        return {
            success: true,
            message: "If an account exists with that email, you will receive a password reset link."
        }
    } catch (error) {
        console.error("Password reset request error:", error)
        return { success: false, error: "An error occurred. Please try again later." }
    }
}
