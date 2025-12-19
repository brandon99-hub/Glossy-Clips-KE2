"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
    expiresAt: string
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
    } | null>(null)

    useEffect(() => {
        const calculateTimeLeft = () => {
            // Get current time in Kenya (EAT - UTC+3)
            const now = new Date()
            const kenyaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }))
            const expiryTime = new Date(expiresAt)

            const difference = expiryTime.getTime() - kenyaTime.getTime()

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                }
            }

            return null
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [expiresAt])

    if (!timeLeft) {
        return (
            <div className="text-red-400 text-sm font-mono">
                EXPIRED
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-white/60">Expires in:</span>
            <div className="flex gap-1 font-mono font-bold">
                {timeLeft.days > 0 && (
                    <>
                        <span className="bg-white/10 px-2 py-1 rounded">{timeLeft.days}d</span>
                    </>
                )}
                <span className="bg-white/10 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="bg-white/10 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span className="bg-white/10 px-2 py-1 rounded text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
        </div>
    )
}
