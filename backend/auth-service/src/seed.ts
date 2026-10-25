import bcrypt from 'bcryptjs';
import { pool } from '@annah/shared';

const email = (process.env.ADMIN_EMAIL || 'annahboutiquemail@gmail.com').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim();
const phone = process.env.ADMIN_PHONE?.trim() || null;

if (!email || !name || !password) throw new Error('ADMIN_NAME and ADMIN_PASSWORD are required; ADMIN_EMAIL defaults to annahboutiquemail@gmail.com');
if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');

try {
  const existing = await pool.query('SELECT id FROM admins WHERE email=$1', [email]);
  if (existing.rowCount) {
    await pool.query('UPDATE admins SET name=$2,phone=$3 WHERE id=$1', [existing.rows[0].id, name, phone]);
    console.log('Admin seed skipped password update because the admin already exists.');
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query('INSERT INTO admins(email,name,phone,password_hash) VALUES($1,$2,$3,$4)', [email, name, phone, passwordHash]);
    console.log('Admin account created.');
  }
} finally {
  await pool.end();
}
