"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface ActiveFilter {
    type: "category" | "price" | "stock" | "sort"
    label: string
    value: string
}

interface ActiveFiltersProps {
    filters: ActiveFilter[]
    onRemove: (filter: ActiveFilter) => void
    onClearAll: () => void
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
    if (filters.length === 0) return null

    return (
        <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.map((filter, index) => (
                <Badge key={`${filter.type}-${index}`} variant="secondary" className="gap-1 pr-1">
                    {filter.label}
                    <button
                        onClick={() => onRemove(filter)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${filter.label} filter`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
            {filters.length > 1 && (
                <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs">
                    Clear all
                </Button>
            )}
        </div>
    )
}
