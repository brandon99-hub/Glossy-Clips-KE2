"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCategories } from "@/hooks/use-categories"

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
}

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
]

export function ProductFiltersImproved({ filters, onFiltersChange, maxPrice = 5000 }: ProductFiltersProps) {
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

    const activeAdvancedFilters =
        (filters.priceMin > 0 || filters.priceMax < maxPrice ? 1 : 0) +
        (filters.inStockOnly ? 1 : 0) +
        (filters.sortBy !== "newest" ? 1 : 0)

    return (
        <div className="space-y-4">
            {/* Category Pills - Always Visible */}
            <div>
                <Label className="text-sm font-medium mb-3 block">Categories</Label>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onFiltersChange({ ...filters, categories: [] })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.categories.length === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        All Products
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryToggle(category.slug)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.categories.includes(category.slug)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Filters - Accordion */}
            <div className="border border-border rounded-lg overflow-hidden">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">More Filters</span>
                        {activeAdvancedFilters > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {activeAdvancedFilters}
                            </span>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                {/* Expanded Content */}
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
                            <div className="px-2">
                                <Slider
                                    min={0}
                                    max={maxPrice}
                                    step={50}
                                    value={[filters.priceMin, filters.priceMax]}
                                    onValueChange={handlePriceChange}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>KES {filters.priceMin.toLocaleString()}</span>
                                <span>KES {filters.priceMax.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Stock Availability */}
                        <div className="space-y-3">
                            <Label>Availability</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="in-stock"
                                    checked={filters.inStockOnly}
                                    onCheckedChange={handleStockToggle}
                                />
                                <label
                                    htmlFor="in-stock"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    In Stock Only
                                </label>
                            </div>
                        </div>

                        {/* Reset Button */}
                        {activeAdvancedFilters > 0 && (
                            <Button variant="outline" onClick={handleReset} className="w-full">
                                Reset All Filters
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
