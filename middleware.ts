import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit, getRateLimitKey } from "./lib/rate-limit"

/**
 * Edge-compatible Web Crypto HMAC-SHA256 verification.
 * Token format: <random-hex>.<HMAC-SHA256-hex>
 */
async function isValidAdminToken(sessionValue: string): Promise<boolean> {
    // Reject the old insecure literal "true" cookie
    if (!sessionValue || sessionValue === "true") return false

    const dotIndex = sessionValue.lastIndexOf(".")
    if (dotIndex === -1) return false

    const token = sessionValue.slice(0, dotIndex)
    const signature = sessionValue.slice(dotIndex + 1)
    const secret = process.env.NEXTAUTH_SECRET

    if (!secret || !token || !signature) return false

    try {
        const encoder = new TextEncoder()
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        )
        const expectedSigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(token))
        const expectedSigHex = Array.from(new Uint8Array(expectedSigBuf))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("")

        if (signature.length !== expectedSigHex.length) return false

        // Constant-time XOR comparison to prevent timing attacks
        let mismatch = 0
        for (let i = 0; i < signature.length; i++) {
            mismatch |= signature.charCodeAt(i) ^ expectedSigHex.charCodeAt(i)
        }
        return mismatch === 0
    } catch {
        return false
    }
}

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-pathname", request.nextUrl.pathname)

    // Security Headers
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
    )
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    )

    // Content Security Policy
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    )

    // Admin Route Protection
    if (request.nextUrl.pathname.startsWith("/admin")) {
        // Redirect any direct access to admin reset routes back to login
        if (
            request.nextUrl.pathname.startsWith("/admin/forgot-password") ||
            request.nextUrl.pathname.startsWith("/admin/reset-password")
        ) {
            return NextResponse.redirect(new URL("/admin/login", request.url))
        }

        const isAuthPage = request.nextUrl.pathname === "/admin/login"
        const adminSession = request.cookies.get("admin_session")?.value
        const isValidSession = adminSession ? await isValidAdminToken(adminSession) : false

        if (!isValidSession && !isAuthPage) {
            const loginUrl = new URL("/admin/login", request.url)
            loginUrl.searchParams.set("from", request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }

        if (isValidSession && isAuthPage) {
            return NextResponse.redirect(new URL("/admin/orders", request.url))
        }
    }

    // Rate Limiting for API routes (EXCLUDE NextAuth)
    if (
        request.nextUrl.pathname.startsWith("/api/") &&
        !request.nextUrl.pathname.startsWith("/api/auth/")
    ) {
        const key = getRateLimitKey(request, "api")

        // Different limits for different endpoints
        let config = { maxRequests: 100, windowMs: 15 * 60 * 1000 } // Default: 100 req/15min

        if (request.nextUrl.pathname.includes("/upload")) {
            config = { maxRequests: 10, windowMs: 60 * 60 * 1000 } // Upload: 10 req/hour
        } else if (request.nextUrl.pathname.includes("/search")) {
            config = { maxRequests: 30, windowMs: 60 * 1000 } // Search: 30 req/min
        }

        const allowed = rateLimit(key, config)
        if (!allowed) {
            return NextResponse.json(
                { error: "Too Many Requests" },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "60",
                    },
                }
            )
        }
    }

    return response
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/:path*",
        "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)",
    ],
}
