"use server"

import { cookies } from "next/headers"
import crypto from "crypto"

/**
 * Verifies the admin session cookie using HMAC signature.
 * Token format: <random-hex>.<HMAC-SHA256-hex>
 */
export async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")?.value

    if (!sessionCookie) return false

    // Reject old insecure "true" cookie values
    if (sessionCookie === "true") return false

    const dotIndex = sessionCookie.lastIndexOf(".")
    if (dotIndex === -1) return false

    const token = sessionCookie.slice(0, dotIndex)
    const signature = sessionCookie.slice(dotIndex + 1)
    const secret = process.env.NEXTAUTH_SECRET

    if (!secret) {
        console.error("[admin-auth] NEXTAUTH_SECRET is not set")
        return false
    }

    try {
        const expectedSig = crypto
            .createHmac("sha256", secret)
            .update(token)
            .digest("hex")

        const sigBuf = Buffer.from(signature, "hex")
        const expBuf = Buffer.from(expectedSig, "hex")

        if (sigBuf.length !== expBuf.length) return false

        // Constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(sigBuf, expBuf)
    } catch {
        return false
    }
}

/**
 * Creates a new signed admin session token and sets the cookie.
 */
export async function createAdminSession(): Promise<void> {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error("NEXTAUTH_SECRET is not configured")

    const token = crypto.randomBytes(32).toString("hex")
    const signature = crypto
        .createHmac("sha256", secret)
        .update(token)
        .digest("hex")

    const signedToken = `${token}.${signature}`
    const cookieStore = await cookies()

    cookieStore.set("admin_session", signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
    })
}

/**
 * Deletes the admin session cookie.
 */
export async function destroyAdminSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")
}

/**
 * Guard for use at the top of every protected server action.
 * Returns { authorized: true } or { authorized: false, error: string }
 */
export async function requireAdminAuth(): Promise<
    { authorized: true } | { authorized: false; error: string }
> {
    const isValid = await verifyAdminSession()
    if (!isValid) {
        return { authorized: false, error: "Unauthorized" }
    }
    return { authorized: true }
}
