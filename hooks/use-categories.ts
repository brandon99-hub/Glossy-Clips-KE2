"use client"

import { useEffect, useState } from "react"
import type { Category } from "@/lib/db"

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching categories:', err)
                setLoading(false)
            })
    }, [])

    return { categories, loading }
}
