import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit, getRateLimitKey } from "./lib/rate-limit"
import { createHmac, timingSafeEqual } from "crypto"

/**
 * Inline HMAC verification — cannot call async server functions from middleware.
 * Token format: <random-hex>.<HMAC-SHA256-hex>
 */
function isValidAdminToken(sessionValue: string): boolean {
    // Reject the old insecure literal "true" cookie
    if (sessionValue === "true") return false

    const dotIndex = sessionValue.lastIndexOf(".")
    if (dotIndex === -1) return false

    const token = sessionValue.slice(0, dotIndex)
    const signature = sessionValue.slice(dotIndex + 1)
    const secret = process.env.NEXTAUTH_SECRET

    if (!secret || !token || !signature) return false

    try {
        const expectedSig = createHmac("sha256", secret).update(token).digest("hex")
        const sigBuf = Buffer.from(signature, "hex")
        const expBuf = Buffer.from(expectedSig, "hex")
        if (sigBuf.length !== expBuf.length) return false
        return timingSafeEqual(sigBuf, expBuf)
    } catch {
        return false
    }
}

export function middleware(request: NextRequest) {
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
        const isAuthPage =
            request.nextUrl.pathname === "/admin/login" ||
            request.nextUrl.pathname.startsWith("/admin/forgot-password") ||
            request.nextUrl.pathname.startsWith("/admin/reset-password")

        const adminSession = request.cookies.get("admin_session")?.value
        const isValidSession = adminSession ? isValidAdminToken(adminSession) : false

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
