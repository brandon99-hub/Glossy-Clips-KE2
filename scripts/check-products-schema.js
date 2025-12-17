const { neon } = require("@neondatabase/serverless");
const fs = require('fs');
const path = require('path');

// Load env manully
const envPath = path.resolve(__dirname, '..', '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envConfig.match(/DATABASE_URL=(.*)/);
const databaseUrl = dbUrlMatch ? dbUrlMatch[1].trim() : null;

if (!databaseUrl) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}

const sql = neon(databaseUrl);

async function checkSchema() {
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products';
        `;
        console.log("Columns:", columns);
    } catch (e) {
        console.error(e);
    }
}

checkSchema();
