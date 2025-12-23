"use client"

import { usePathname, useRouter } from "next/navigation"
import { Package, Heart, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"

type DashboardBottomNavProps = {
    activeTab: "orders" | "wishlist" | "waitlist" | "profile"
    onTabChange: (tab: "orders" | "wishlist" | "waitlist" | "profile") => void
    counts: {
        orders: number
        wishlist: number
        waitlist: number
    }
}

export function DashboardBottomNav({ activeTab, onTabChange, counts }: DashboardBottomNavProps) {
    const links = [
        { id: "orders" as const, icon: Package, label: "Orders", count: counts.orders },
        { id: "wishlist" as const, icon: Heart, label: "Wishlist", count: counts.wishlist },
        { id: "waitlist" as const, icon: Bell, label: "Waitlist", count: counts.waitlist },
        { id: "profile" as const, icon: User, label: "Profile", count: 0 },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-white/40 md:hidden shadow-2xl">
            <div className="flex items-center justify-around py-2 px-2 safe-area-pb">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = activeTab === link.id
                    return (
                        <button
                            key={link.id}
                            onClick={() => onTabChange(link.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-2.5 text-xs transition-all relative min-w-[70px] rounded-2xl",
                                isActive
                                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white scale-105 shadow-lg shadow-rose-200"
                                    : "text-muted-foreground hover:text-foreground active:scale-95",
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
                                {link.count > 0 && !isActive && (
                                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                                        {link.count > 9 ? "9+" : link.count}
                                    </span>
                                )}
                            </div>
                            <span className={cn("font-bold", isActive && "tracking-wide")}>{link.label}</span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
