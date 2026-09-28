const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const sql = neon(databaseUrl);
const migrationFile = path.join(__dirname, "029-add-fts-indexes.sql");

async function run() {
    console.log("Running migration 029-add-fts-indexes.sql...");
    try {
        const query = fs.readFileSync(migrationFile, "utf8");
        await sql(query);
        console.log("✓ Success: FTS indexes added.");
    } catch (err) {
        console.error("✗ Error:", err);
    }
}

run();
