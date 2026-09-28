import { sql } from '@/lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
    try {
        console.log('Running migration: 006-add-bundle-image.sql')

        // Read the migration file
        const migrationPath = path.join(process.cwd(), 'scripts', '006-add-bundle-image.sql')
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

        // Execute the migration
        await sql.unsafe(migrationSQL)

        console.log('✅ Migration completed successfully!')
        process.exit(0)
    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
