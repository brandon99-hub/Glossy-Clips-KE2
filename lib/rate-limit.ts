// In-memory rate limiting (no Redis needed)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
            rateLimitMap.delete(key)
        }
    }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    maxRequests: number
    windowMs: number
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const limit = rateLimitMap.get(identifier)

    if (!limit || now > limit.resetTime) {
        // New window
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        })
        return true
    }

    if (limit.count >= config.maxRequests) {
        // Rate limit exceeded
        return false
    }

    // Increment count
    limit.count++
    return true
}

export function getRateLimitKey(request: Request, prefix: string): string {
    // Try to get IP from headers
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : "unknown"
    return `${prefix}:${ip}`
}
