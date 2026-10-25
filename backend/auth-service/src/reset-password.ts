import bcrypt from 'bcryptjs';
import { pool } from '@annah/shared';

const email = (process.env.ADMIN_EMAIL || 'annahboutiquemail@gmail.com').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error('ADMIN_PASSWORD is required for an explicit password reset');
if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');

try {
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query('UPDATE admins SET password_hash=$2 WHERE email=$1 RETURNING id', [email, passwordHash]);
  if (!result.rowCount) throw new Error(`No admin exists for ${email}`);
  await pool.query('UPDATE admin_sessions SET revoked_at=now() WHERE admin_id=$1 AND revoked_at IS NULL', [result.rows[0].id]);
  console.log('Admin password reset and existing sessions revoked.');
} finally {
  await pool.end();
}
