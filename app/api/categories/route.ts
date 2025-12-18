import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const categories = await sql`
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY display_order ASC, name ASC
    `
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}
