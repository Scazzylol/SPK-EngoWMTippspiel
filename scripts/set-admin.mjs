import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

const username = process.argv[2];
const action = process.argv[3] || 'promote'; // promote or demote

if (!username) {
  console.log('Usage: node scripts/set-admin.mjs <username> [promote|demote]');
  process.exit(1);
}

try {
  const isAdmin = action === 'promote';
  const result = await sql`
    UPDATE better_auth_user
    SET is_admin = ${isAdmin}
    WHERE username = ${username}
    RETURNING id, username, is_admin
  `;

  if (result.length === 0) {
    console.log(`User "${username}" not found.`);
    process.exit(1);
  } else {
    console.log(`✅ "${username}" is now ${isAdmin ? 'admin' : 'regular user'}:`, result[0]);
  }
} catch (e) {
  console.error('Failed:', e);
  process.exit(1);
} finally {
  await sql.end();
}
