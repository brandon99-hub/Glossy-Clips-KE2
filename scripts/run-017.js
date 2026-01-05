const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const sql = neon(databaseUrl);
const migrationFile = path.join(__dirname, "017-advanced-address-fields.sql");

async function run() {
    console.log("Running migration 017-advanced-address-fields.sql...");
    try {
        const query = fs.readFileSync(migrationFile, "utf8");
        await sql(query);
        console.log("✓ Success");
    } catch (err) {
        console.error("✗ Error:", err);
    }
}

run();
