const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function run() {
    console.log('Running migration 018: Advanced Address Fields for Orders');
    const sqlPath = path.join(__dirname, '018-order-address-fields.sql');
    const queries = fs.readFileSync(sqlPath, 'utf8');

    try {
        // Neon can handle multiple statements if they are separated by semicolons
        // but it's safer to split them for some drivers. @neondatabase/serverless handles it.
        await sql(queries);
        console.log('Migration 018 completed successfully.');
    } catch (err) {
        console.error('Error running migration 018:', err);
        process.exit(1);
    }
}

run();
