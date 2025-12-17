/**
 * Script to update admin password to "Temppassword-123"
 * Run with: node scripts/update-admin-password.js
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

// Load DATABASE_URL from .env
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=(.+)/);

    if (!match) {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }

    return match[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
}

async function updateAdminPassword() {
    const DATABASE_URL = loadEnv();
    const sql = neon(DATABASE_URL);

    const newPassword = 'Temppassword-123';

    console.log('Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('Generated hash:', hashedPassword);
    console.log('\nUpdating database...');

    await sql`
        UPDATE admin_users 
        SET password_hash = ${hashedPassword}
        WHERE username = 'admin'
    `;

    console.log('✅ Password updated successfully!');
    console.log('\nYou can now login with:');
    console.log('Username: admin');
    console.log('Password: Temppassword-123');

    // Verify the update
    const result = await sql`
        SELECT username, email FROM admin_users WHERE username = 'admin'
    `;

    console.log('\nAdmin user details:', result[0]);
}

updateAdminPassword().catch(console.error);
