// Script to generate bcrypt hash for admin password
const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'Oreosdonut';
    const hash = await bcrypt.hash(password, 10);

    console.log('\n=== Admin Credentials ===');
    console.log('Username: Bianca B');
    console.log('Password: Oreosdonut');
    console.log('\nBcrypt Hash:');
    console.log(hash);
    console.log('\n=== SQL Command ===');
    console.log(`
INSERT INTO admin_users (username, password_hash, created_at)
VALUES (
    'Bianca B',
    '${hash}',
    NOW()
)
ON CONFLICT (username) DO NOTHING;
    `);
}

generateHash().catch(console.error);
