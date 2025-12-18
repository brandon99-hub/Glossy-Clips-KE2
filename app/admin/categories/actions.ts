'use server'

import { sql } from '@/lib/db'
import { revalidatePath } from 'next/cache'

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export async function createCategory(formData: FormData) {
    try {
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const slug = formData.get('slug') as string || generateSlug(name)
        const image = formData.get('image') as string
        const isActive = formData.get('is_active') === 'on'

        // Get max display_order
        const result = await sql`SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM categories`
        const displayOrder = result[0].next_order

        await sql`
      INSERT INTO categories (name, slug, description, image, display_order, is_active)
      VALUES (${name}, ${slug}, ${description}, ${image}, ${displayOrder}, ${isActive})
    `

        revalidatePath('/admin/categories')
        revalidatePath('/shop')
        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error creating category:', error)
        if (error.message?.includes('unique')) {
            return { success: false, error: 'Category name or slug already exists' }
        }
        return { success: false, error: 'Failed to create category' }
    }
}

export async function updateCategory(formData: FormData) {
    try {
        const id = parseInt(formData.get('id') as string)
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const slug = formData.get('slug') as string
        const image = formData.get('image') as string
        const isActive = formData.get('is_active') === 'on'

        await sql`
      UPDATE categories
      SET name = ${name}, 
          slug = ${slug},
          description = ${description},
          image = ${image},
          is_active = ${isActive}
      WHERE id = ${id}
    `

        revalidatePath('/admin/categories')
        revalidatePath('/shop')
        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating category:', error)
        if (error.message?.includes('unique')) {
            return { success: false, error: 'Category name or slug already exists' }
        }
        return { success: false, error: 'Failed to update category' }
    }
}

export async function deleteCategory(id: number) {
    try {
        // Check if any products use this category
        const products = await sql`SELECT COUNT(*) as count FROM products WHERE category = (SELECT slug FROM categories WHERE id = ${id})`

        if (products[0].count > 0) {
            return { success: false, error: `Cannot delete category with ${products[0].count} product(s)` }
        }

        await sql`DELETE FROM categories WHERE id = ${id}`

        revalidatePath('/admin/categories')
        revalidatePath('/shop')
        return { success: true }
    } catch (error) {
        console.error('Error deleting category:', error)
        return { success: false, error: 'Failed to delete category' }
    }
}

export async function updateCategoryOrder(categoryId: number, newOrder: number) {
    try {
        await sql`
      UPDATE categories
      SET display_order = ${newOrder}
      WHERE id = ${categoryId}
    `

        revalidatePath('/admin/categories')
        revalidatePath('/shop')
        return { success: true }
    } catch (error) {
        console.error('Error updating category order:', error)
        return { success: false, error: 'Failed to update order' }
    }
}
