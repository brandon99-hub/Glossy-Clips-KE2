"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Package, MessageSquare, Gift, QrCode, LogOut, Sparkles, Menu, X, PackageOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { adminLogout } from "@/app/admin/login/actions"

const navItems = [
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/bundles", icon: PackageOpen, label: "Bundles" },
  { href: "/admin/testimonials", icon: MessageSquare, label: "Testimonials" },
  { href: "/admin/gift-cards", icon: Gift, label: "Gift Cards" },
  { href: "/admin/qr-codes", icon: QrCode, label: "QR Codes" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await adminLogout()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-background border border-border p-2 rounded-lg shadow-sm"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-semibold">GLOSSYCLIPSKE</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
