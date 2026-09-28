"use client"

import { useEffect, useState } from "react"
import type { Category } from "@/lib/db"

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/categories')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch categories: ${res.statusText}`)
                }
                return res.json()
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching categories:', err)
                setLoading(false)
            })
    }, [])

    return { categories, loading }
}
