const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

// Read .env manually
const envPath = path.join(__dirname, "..", ".env");
let databaseUrl = "";

try {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/DATABASE_URL=(.+)/);
    if (match) {
        databaseUrl = match[1].trim();
        // Remove quotes if present
        if (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) {
            databaseUrl = databaseUrl.slice(1, -1);
        }
    }
} catch (e) {
    console.error("Could not read .env file:", e);
    process.exit(1);
}

if (!databaseUrl) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
    console.log("Adding is_exported column...");
    try {
        await sql`ALTER TABLE secret_codes ADD COLUMN IF NOT EXISTS is_exported BOOLEAN DEFAULT FALSE;`;
        console.log("✓ Success");
    } catch (err) {
        console.error("✗ Error:", err);
    }
}

run();
