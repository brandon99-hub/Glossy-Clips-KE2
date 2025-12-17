"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Grid3X3, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"

export function MobileNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shop", icon: Grid3X3, label: "Shop" },
    { href: "/testimonials", icon: Heart, label: "Love" },
    { href: "/cart", icon: ShoppingBag, label: "Cart", badge: totalItems },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 safe-area-pb">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </div>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
