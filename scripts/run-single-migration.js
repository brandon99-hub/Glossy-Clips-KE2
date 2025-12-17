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
const migrationFile = path.join(__dirname, "011-update-products-schema.sql");

async function run() {
    console.log("Running migration 011-update-products-schema.sql...");
    try {
        const query = fs.readFileSync(migrationFile, "utf8");
        // Split by semicolon via simple split if needed, or just run as one block if neon supports it.
        // Neon usually supports multiple statements in one call.
        await sql(query);
        console.log("✓ Success");
    } catch (err) {
        console.error("✗ Error:", err);
    }
}

run();
