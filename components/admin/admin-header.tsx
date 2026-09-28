"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
  const pathname = usePathname()

  // Format pathname into readable title
  const getSectionTitle = () => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length <= 1) return "Dashboard"
    const sub = segments[1]
    return sub
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground font-medium">Admin</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">{getSectionTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Live Admin
        </div>

        <Link href="/" target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">View Store</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
