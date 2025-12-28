import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit, getRateLimitKey } from "./lib/rate-limit"

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
