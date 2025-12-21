"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Loader2, CheckCircle } from "lucide-react"
import { joinWaitlist } from "@/app/api/waitlist/actions"
import { toast } from "sonner"

type WaitlistButtonProps = {
    productId: number
    productName: string
}

export function WaitlistButton({ productId, productName }: WaitlistButtonProps) {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [joined, setJoined] = useState(false)
    const [showEmailInput, setShowEmailInput] = useState(false)
    const [email, setEmail] = useState("")

    const handleJoin = async (e?: React.FormEvent) => {
        e?.preventDefault()
        setLoading(true)

        const result = await joinWaitlist(productId, email)

        if (result.success) {
            toast.success(result.message)
            setJoined(true)
            setShowEmailInput(false)
        } else {
            toast.error(result.error)
        }

        setLoading(false)
    }

    if (joined) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">You're on the waitlist!</p>
                    <p className="text-xs text-green-700">We'll email you when it's back in stock</p>
                </div>
            </div>
        )
    }

    if (!session?.user && !showEmailInput) {
        return (
            <Button
                onClick={() => setShowEmailInput(true)}
                variant="outline"
                className="w-full gap-2 border-2 border-primary hover:bg-primary/10"
            >
                <Bell className="w-4 h-4" />
                Notify Me When Available
            </Button>
        )
    }

    if (!session?.user && showEmailInput) {
        return (
            <form onSubmit={handleJoin} className="space-y-2">
                <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                />
                <div className="flex gap-2">
                    <Button
                        type="submit"
                        disabled={loading || !email}
                        className="flex-1 gap-2 bg-gradient-to-r from-rose-500 to-pink-500"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Joining...
                            </>
                        ) : (
                            <>
                                <Bell className="w-4 h-4" />
                                Join Waitlist
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEmailInput(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        )
    }

    return (
        <Button
            onClick={() => handleJoin()}
            disabled={loading}
            className="w-full gap-2 bg-gradient-to-r from-rose-500 to-pink-500"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                </>
            ) : (
                <>
                    <Bell className="w-4 h-4" />
                    Notify Me When Available
                </>
            )}
        </Button>
    )
}
