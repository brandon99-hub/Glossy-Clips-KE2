"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCategories } from "@/hooks/use-categories"
import { cn } from "@/lib/utils"

export interface FilterState {
    priceMin: number
    priceMax: number
    categories: string[]
    inStockOnly: boolean
    sortBy: string
}

interface ProductFiltersProps {
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    maxPrice?: number
    searchInput?: React.ReactNode
}

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
]

export function ProductFiltersImproved({
    filters,
    onFiltersChange,
    maxPrice = 5000,
    searchInput,
}: ProductFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const { categories } = useCategories()

    const handlePriceChange = (values: number[]) => {
        onFiltersChange({ ...filters, priceMin: values[0], priceMax: values[1] })
    }

    const handleCategoryToggle = (categorySlug: string) => {
        const newCategories = filters.categories.includes(categorySlug)
            ? filters.categories.filter((c) => c !== categorySlug)
            : [...filters.categories, categorySlug]
        onFiltersChange({ ...filters, categories: newCategories })
    }

    const handleStockToggle = () => {
        onFiltersChange({ ...filters, inStockOnly: !filters.inStockOnly })
    }

    const handleSortChange = (value: string) => {
        onFiltersChange({ ...filters, sortBy: value })
    }

    const handleReset = () => {
        onFiltersChange({
            priceMin: 0,
            priceMax: maxPrice,
            categories: [],
            inStockOnly: false,
            sortBy: "newest",
        })
        setIsExpanded(false)
    }

    const totalActiveFilters =
        (filters.categories.length > 0 ? 1 : 0) +
        (filters.priceMin > 0 || filters.priceMax < maxPrice ? 1 : 0) +
        (filters.inStockOnly ? 1 : 0) +
        (filters.sortBy !== "newest" ? 1 : 0)

    return (
        <div className="space-y-4">
            {/* ==================================================== */}
            {/* DESKTOP VIEW (md: and above) */}
            {/* Filter button to the left of search; categories inside filter tray */}
            {/* ==================================================== */}
            <div className="hidden md:block space-y-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            "h-12 px-5 rounded-full border text-sm font-semibold flex items-center gap-2.5 transition-all shrink-0 shadow-xs",
                            isExpanded
                                ? "border-primary bg-primary/10 text-primary"
                                : totalActiveFilters > 0
                                    ? "border-primary/50 bg-primary/5 text-foreground"
                                    : "border-border bg-background text-foreground hover:bg-muted/60"
                        )}
                        aria-expanded={isExpanded}
                        aria-label="Toggle product filters"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filters</span>
                        {totalActiveFilters > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {totalActiveFilters}
                            </span>
                        )}
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                    </button>

                    {/* Full-width Search on Desktop */}
                    {searchInput && (
                        <div className="flex-1">
                            {searchInput}
                        </div>
                    )}
                </div>

                {/* Expanded Desktop Filter Tray */}
                {isExpanded && (
                    <div className="border border-border/80 bg-card rounded-2xl p-6 shadow-sm transition-all animate-in fade-in-50 slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                            {/* 1. Category Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                                <Select
                                    value={filters.categories[0] || "all"}
                                    onValueChange={(val) => {
                                        if (val === "all") {
                                            onFiltersChange({ ...filters, categories: [] })
                                        } else {
                                            onFiltersChange({ ...filters, categories: [val] })
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.slug}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 2. Sort By */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort By</Label>
                                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SORT_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 3. Price Range Presets */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price Range</Label>
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, priceMin: 0, priceMax: maxPrice })}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                            filters.priceMin === 0 && filters.priceMax === maxPrice
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        Any
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, priceMin: 0, priceMax: 500 })}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                            filters.priceMin === 0 && filters.priceMax === 500
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        &lt; 500
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, priceMin: 500, priceMax: 1000 })}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                            filters.priceMin === 500 && filters.priceMax === 1000
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        500 - 1K
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, priceMin: 1000, priceMax: maxPrice })}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                            filters.priceMin === 1000 && filters.priceMax === maxPrice
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        Over 1K
                                    </button>
                                </div>
                            </div>

                            {/* 4. Availability & Reset */}
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Availability</Label>
                                <div className="flex items-center space-x-2 pt-1">
                                    <Checkbox
                                        id="in-stock-desktop"
                                        checked={filters.inStockOnly}
                                        onCheckedChange={handleStockToggle}
                                    />
                                    <label
                                        htmlFor="in-stock-desktop"
                                        className="text-sm font-medium leading-none cursor-pointer select-none"
                                    >
                                        In Stock Only
                                    </label>
                                </div>

                                {totalActiveFilters > 0 && (
                                    <div className="pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleReset}
                                            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                                        >
                                            Reset all filters
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ==================================================== */}
            {/* MOBILE VIEW (< md) */}
            {/* Preserves search on top, category pills, and accordion */}
            {/* ==================================================== */}
            <div className="md:hidden space-y-4">
                {searchInput && (
                    <div className="mb-2">
                        {searchInput}
                    </div>
                )}

                {/* Category Pills - Visible on Mobile */}
                <div>
                    <Label className="text-sm font-medium mb-3 block">Categories</Label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => onFiltersChange({ ...filters, categories: [] })}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                filters.categories.length === 0
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            All Products
                        </button>
                        {categories.map((category) => (
                            <button
                                type="button"
                                key={category.id}
                                onClick={() => handleCategoryToggle(category.slug)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                    filters.categories.includes(category.slug)
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Advanced Filters Accordion */}
                <div className="border border-border rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">More Filters</span>
                            {totalActiveFilters > 0 && (
                                <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalActiveFilters}
                                </span>
                            )}
                        </div>
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>

                    {/* Mobile Expanded Content */}
                    {isExpanded && (
                        <div className="p-4 space-y-6 bg-card">
                            {/* Sort By */}
                            <div className="space-y-2">
                                <Label>Sort By</Label>
                                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SORT_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-3">
                                <Label>Price Range</Label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, priceMin: 0, priceMax: maxPrice })}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                            filters.priceMin === 0 && filters.priceMax === maxPrice
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        Any Price
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, priceMin: 0, priceMax: 500 })}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                            filters.priceMin === 0 && filters.priceMax === 500
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        Under 500
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, priceMin: 500, priceMax: 1000 })}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                            filters.priceMin === 500 && filters.priceMax === 1000
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        500 - 1,000
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, priceMin: 1000, priceMax: maxPrice })}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                            filters.priceMin === 1000 && filters.priceMax === maxPrice
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        Over 1,000
                                    </button>
                                </div>
                            </div>

                            {/* Stock Availability */}
                            <div className="space-y-3">
                                <Label>Availability</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="in-stock-mobile"
                                        checked={filters.inStockOnly}
                                        onCheckedChange={handleStockToggle}
                                    />
                                    <label
                                        htmlFor="in-stock-mobile"
                                        className="text-sm font-medium leading-none cursor-pointer select-none"
                                    >
                                        In Stock Only
                                    </label>
                                </div>
                            </div>

                            {/* Reset Button */}
                            {totalActiveFilters > 0 && (
                                <Button variant="outline" onClick={handleReset} className="w-full">
                                    Reset All Filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

