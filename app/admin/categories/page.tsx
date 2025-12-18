import { sql } from '@/lib/db'
import type { Category } from '@/lib/db'
import { CategoriesManager } from './categories-manager'

export default async function CategoriesPage() {
    const categories = await sql`
    SELECT * FROM categories 
    ORDER BY display_order ASC, name ASC
  ` as Category[]

    return <CategoriesManager categories={categories} />
}
